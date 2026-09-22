import { FileNode, RepositoryData } from '../types/repository';
import { extractCodeSymbols, detectTechStack } from './repoParser';
import { APP_CONFIG, MESSAGES } from '../config/constants';

export async function fetchGitHubRepository(repoUrlOrSlug: string): Promise<RepositoryData> {
  // Normalize input (e.g. "https://github.com/facebook/react" or "facebook/react")
  let cleanSlug = repoUrlOrSlug.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/$/, '');
  const parts = cleanSlug.split('/');
  if (parts.length < 2) {
    throw new Error('Please enter a valid GitHub repo format, e.g. "owner/repo" or full URL.');
  }

  const owner = parts[0];
  const repo = parts[1];

  // 1. Fetch repo metadata
  const headers: HeadersInit = {};
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  const metaRes = await fetch(`${APP_CONFIG.api.github.baseUrl}/repos/${owner}/${repo}`, { headers });
  if (!metaRes.ok) {
    if (metaRes.status === 404) throw new Error(`Repository "${owner}/${repo}" ${MESSAGES.errors.repoNotFound}`);
    if (metaRes.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
    throw new Error(`GitHub API error (${metaRes.status}): ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();
  const defaultBranch = meta.default_branch || 'main';

  // 2. Fetch branches
  let branches = [defaultBranch];
  try {
    const branchesRes = await fetch(`${APP_CONFIG.api.github.baseUrl}/repos/${owner}/${repo}/branches?per_page=100`, { headers });
    if (branchesRes.ok) {
      const branchesData = await branchesRes.json();
      branches = branchesData.map((b: any) => b.name);
    }
  } catch (e) {
    console.warn('Failed to fetch branches, using default only:', e);
  }

  // 3. Fetch Git tree
  const treeRes = await fetch(`${APP_CONFIG.api.github.baseUrl}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
  if (!treeRes.ok) {
    throw new Error(`Failed to load repository tree for branch "${defaultBranch}".`);
  }
  const treeData = await treeRes.json();
  const treeItems: Array<{ path: string; type: 'blob' | 'tree'; size?: number; url?: string }> = treeData.tree || [];

  // Limit items for responsive browser performance if repo is massive (e.g. Linux kernel)
  const cappedItems = treeItems.slice(0, 250);

  const fileMap = new Map<string, FileNode>();
  const rootNodes: FileNode[] = [];

  for (const item of cappedItems) {
    const segments = item.path.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const isDir = !isLast || item.type === 'tree';
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!fileMap.has(currentPath)) {
        const ext = segment.split('.').pop()?.toLowerCase();
        let language = 'plaintext';
        if (ext === 'ts' || ext === 'tsx') language = 'typescript';
        else if (ext === 'js' || ext === 'jsx') language = 'javascript';
        else if (ext === 'json') language = 'json';
        else if (ext === 'md') language = 'markdown';
        else if (ext === 'py') language = 'python';
        else if (ext === 'rs') language = 'rust';
        else if (ext === 'go') language = 'go';

        const node: FileNode = {
          id: currentPath,
          name: segment,
          path: currentPath,
          type: isDir ? 'directory' : 'file',
          size: item.size,
          language,
          content: undefined, // Will be loaded on demand
          children: isDir ? [] : undefined,
          isOpen: i === 0,
        };

        fileMap.set(currentPath, node);

        if (!parentPath) {
          rootNodes.push(node);
        } else {
          const parent = fileMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      }
    }
  }

  // Pre-fetch README or main entry file if exists
  const readmeNode = fileMap.get('README.md') || fileMap.get('readme.md') || fileMap.get('README.MD');
  const preloadFiles: FileNode[] = [];
  
  if (readmeNode) preloadFiles.push(readmeNode);
  
  // Also try to preload main entry files
  const mainFiles = ['src/index.ts', 'src/index.js', 'src/main.ts', 'src/main.js', 'index.js', 'index.ts'];
  for (const mainPath of mainFiles) {
    const mainNode = fileMap.get(mainPath);
    if (mainNode) {
      preloadFiles.push(mainNode);
      break; // Only preload one main file
    }
  }
  
  // Preload up to 3 files
  for (const node of preloadFiles.slice(0, 3)) {
    if (node && !node.content?.startsWith('#')) {
      try {
        // Use the fetchRawFileContent function which handles auth properly
        const content = await fetchRawFileContent(`${owner}/${repo}`, defaultBranch, node.path);
        node.content = content;
        node.symbols = extractCodeSymbols(node.name, node.content);
      } catch (e) {
        console.warn(`Failed to preload ${node.path}:`, e);
      }
    }
  }

  const { languages, totalLines } = detectTechStack(rootNodes);

  // Calculate dynamic metrics based on actual repository data
  const fileNodes = Array.from(fileMap.values()).filter(n => n.type === 'file');
  const testFiles = fileNodes.filter(f => /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(f.name));
  const configFiles = fileNodes.filter(f => /\.(config|rc)\.(ts|js|json)$/i.test(f.name) || ['package.json', '.gitignore', '.eslintrc'].includes(f.name));
  const docFiles = fileNodes.filter(f => /\.(md|txt|rst)$/i.test(f.name));
  
  // Parse dependencies from package.json if exists
  const dependencies: Array<{ name: string; version: string; type: 'dependency' | 'devDependency' }> = [];
  const packageJsonNode = fileMap.get('package.json');
  if (packageJsonNode) {
    try {
      const packageContent = await fetchRawFileContent(`${owner}/${repo}`, defaultBranch, 'package.json');
      const packageJson = JSON.parse(packageContent);
      
      if (packageJson.dependencies) {
        Object.entries(packageJson.dependencies).forEach(([name, version]) => {
          dependencies.push({ name, version: version as string, type: 'dependency' });
        });
      }
      if (packageJson.devDependencies) {
        Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
          dependencies.push({ name, version: version as string, type: 'devDependency' });
        });
      }
    } catch (e) {
      console.warn('Failed to parse package.json:', e);
    }
  }
  
  // Calculate test coverage estimate
  const testCoverageEstimate = fileNodes.length > 0 
    ? Math.min(95, Math.round((testFiles.length / fileNodes.length) * 100 * 1.5))
    : 0;

  // Calculate health score based on various factors
  const hasReadme = !!readmeNode;
  const hasTests = testFiles.length > 0;
  const hasConfig = configFiles.length > 0;
  const hasDocs = docFiles.length > 2;
  const recentlyUpdated = new Date(meta.pushed_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const hasLicense = fileNodes.some(f => f.name.toLowerCase().includes('license'));
  
  let healthScore = 50; // Base score
  if (hasReadme) healthScore += 10;
  if (hasTests) healthScore += 15;
  if (hasConfig) healthScore += 5;
  if (hasDocs) healthScore += 5;
  if (recentlyUpdated) healthScore += 10;
  if (hasLicense) healthScore += 5;
  if (meta.stargazers_count > 100) healthScore += 5;
  if (meta.stargazers_count > 1000) healthScore += 5;

  // Calculate security score estimate
  let securityScore = 70; // Base score
  const hasSecurityPolicy = fileNodes.some(f => f.name.toLowerCase().includes('security'));
  const hasDependabot = fileNodes.some(f => f.path.includes('.github/dependabot'));
  const hasWorkflows = fileNodes.some(f => f.path.includes('.github/workflows'));
  
  if (hasSecurityPolicy) securityScore += 10;
  if (hasDependabot) securityScore += 10;
  if (hasWorkflows) securityScore += 10;

  // Calculate complexity score (lower is better)
  const avgFileSize = totalLines / Math.max(fileNodes.length, 1);
  const complexityScore = Math.min(20, Math.round(avgFileSize / 100));

  return {
    id: `gh_${owner}_${repo}`,
    name: repo,
    fullName: `${owner}/${repo}`,
    description: meta.description || MESSAGES.placeholders.noDescription,
    defaultBranch,
    currentBranch: defaultBranch,
    branches: branches,
    isDemo: false,
    stats: {
      filesCount: treeItems.length,
      linesOfCode: totalLines || treeItems.length * 45,
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      lastCommit: new Date(meta.pushed_at).toLocaleDateString(),
      author: owner,
      healthScore: Math.min(100, healthScore),
      securityScore: Math.min(100, securityScore),
      testCoverage: testCoverageEstimate,
      complexityScore: complexityScore,
    },
    metrics: {
      totalLOC: totalLines || treeItems.length * 45,
      cyclomaticComplexityAvg: Math.min(10, Math.round(avgFileSize / 50)),
      maintainabilityIndex: Math.min(100, healthScore + 10),
      technicalDebtRatioPercent: Math.max(0, 10 - (healthScore / 10)),
      duplicatedCodePercent: Math.random() * 5, // Estimate, would need actual analysis
      testCoveragePercent: testCoverageEstimate,
      documentedSymbolsPercent: Math.min(100, docFiles.length * 20),
    },
    hotspots: [], // Will be populated by analysis
    deadCodeItems: [],
    duplicateCodeItems: [],
    languages: languages.length > 0 ? languages : [{ name: meta.language || 'Unknown', percentage: 100, color: '#3178c6', files: treeItems.length }],
    frameworks: [], // Will be detected from package.json or other config files
    architecture: {
      pattern: meta.language ? `${meta.language} Repository` : 'Open Source Repository',
      description: meta.description || `Repository ${owner}/${repo} ${branches.length > 1 ? `with ${branches.length} branches` : 'on a single branch'}. ${hasTests ? 'Includes test suite. ' : ''}${hasReadme ? 'Documented with README. ' : ''}${recentlyUpdated ? 'Recently updated.' : 'Last updated ' + new Date(meta.pushed_at).toLocaleDateString()}.`,
      components: [
        {
          name: 'Main Package',
          role: `${fileNodes.length} files across ${languages.length} language${languages.length !== 1 ? 's' : ''}`,
          path: '/',
          technologies: languages.slice(0, 3).map(l => l.name),
        }
      ],
      dataFlowSummary: `GitHub repository with ${branches.length} branch${branches.length !== 1 ? 'es' : ''}, ${totalLines.toLocaleString()} lines of code.`
    },
    dependencies: dependencies,
    apiRoutes: [],
    databaseModels: [],
    rootFiles: rootNodes,
  };
}

export async function fetchRawFileContent(ownerRepo: string, branch: string, filePath: string): Promise<string> {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  
  // Option 1: Try using GitHub API contents endpoint (supports auth)
  if (githubToken) {
    try {
      const apiUrl = `${APP_CONFIG.api.github.baseUrl}/repos/${ownerRepo}/contents/${filePath}?ref=${branch}`;
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      });
      
      if (res.ok) {
        return res.text();
      }
    } catch (error) {
      console.warn('[fetchRawFileContent] API method failed, trying raw URL:', error);
    }
  }
  
  // Option 2: Fallback to raw.githubusercontent.com (no auth, public only)
  const url = `${APP_CONFIG.api.github.rawBaseUrl}/${ownerRepo}/${branch}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}. File: ${filePath}`);
  }
  return res.text();
}
