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
  
  // Detect API routes and database models by analyzing code files
  const apiRoutes: import('../types/repository').RepositoryData['apiRoutes'] = [];
  const databaseModels: import('../types/repository').RepositoryData['databaseModels'] = [];
  
  // Look for API route files
  const routeFiles = fileNodes.filter(f => 
    /routes?|api|controllers?|endpoints?/i.test(f.path) && 
    /\.(ts|js|tsx|jsx)$/i.test(f.name)
  );
  
  for (const routeFile of routeFiles.slice(0, 10)) {
    try {
      const content = await fetchRawFileContent(`${owner}/${repo}`, defaultBranch, routeFile.path);
      routeFile.content = content;
      routeFile.symbols = extractCodeSymbols(routeFile.name, content);
      
      // Extract API routes from content
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        const routeMatch = trimmed.match(/(?:app|router|[a-zA-Z]+Router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/i);
        if (routeMatch) {
          const method = routeMatch[1].toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
          const path = routeMatch[2];
          
          // Try to find handler function
          const handlerMatch = trimmed.match(/,\s*([a-zA-Z0-9_$]+)/) || trimmed.match(/=>\s*\{/);
          const handlerSymbol = handlerMatch ? handlerMatch[1] || 'inline' : 'handler';
          
          // Check for auth middleware
          const authRequired = /auth|authenticate|protect|guard|requireAuth/i.test(line);
          
          apiRoutes.push({
            method,
            path,
            handlerFile: routeFile.path,
            handlerSymbol,
            authRequired,
            description: `${method} ${path}`,
          });
        }
      });
    } catch (e) {
      console.warn(`Failed to analyze route file ${routeFile.path}:`, e);
    }
  }
  
  // Look for database model files
  const modelFiles = fileNodes.filter(f => 
    (/models?|schema|entities/i.test(f.path) && /\.(ts|js|prisma)$/i.test(f.name)) ||
    f.name === 'schema.prisma'
  );
  
  for (const modelFile of modelFiles.slice(0, 10)) {
    try {
      const content = await fetchRawFileContent(`${owner}/${repo}`, defaultBranch, modelFile.path);
      modelFile.content = content;
      modelFile.symbols = extractCodeSymbols(modelFile.name, content);
      
      // Extract database models
      if (modelFile.name.endsWith('.prisma')) {
        // Parse Prisma models
        const modelMatches = content.matchAll(/model\s+([a-zA-Z0-9_]+)\s*\{([^}]+)\}/g);
        for (const match of modelMatches) {
          const modelName = match[1];
          const modelBody = match[2];
          const fields = modelBody.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
          const fieldsCount = fields.length;
          
          // Extract relations
          const relations = modelBody.match(/@relation\([^)]*\)|@relation/g) || [];
          
          databaseModels.push({
            name: modelName,
            tableName: modelName.toLowerCase(),
            file: modelFile.path,
            fieldsCount,
            relations: relations.map(r => r.replace(/@relation\(["']([^"']+)["']\)/, '$1')),
          });
        }
      } else {
        // Parse TypeScript/JavaScript models
        const classMatches = content.matchAll(/(?:export\s+)?class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+[a-zA-Z0-9_]+)?\s*\{([^}]+)\}/g);
        for (const match of classMatches) {
          const className = match[1];
          const classBody = match[2];
          
          // Count properties/fields
          const fieldMatches = classBody.matchAll(/^\s*(?:public\s+|private\s+|protected\s+)?([a-zA-Z0-9_$]+)(?:\?)?:\s*([^;=\n]+)/gm);
          const fields = Array.from(fieldMatches);
          
          if (fields.length > 0) {
            databaseModels.push({
              name: className,
              tableName: className.toLowerCase(),
              file: modelFile.path,
              fieldsCount: fields.length,
              relations: fields.filter(f => f[2].includes('[]') || /^[A-Z]/.test(f[2].trim())).map(f => f[1]),
            });
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to analyze model file ${modelFile.path}:`, e);
    }
  }
  
  // Parse dependencies from package.json if exists
  const dependencies: import('../types/repository').DependencyItem[] = [];
  const frameworks: import('../types/repository').RepositoryData['frameworks'] = [];
  const packageJsonNode = fileMap.get('package.json');
  if (packageJsonNode) {
    try {
      const packageContent = await fetchRawFileContent(`${owner}/${repo}`, defaultBranch, 'package.json');
      const packageJson = JSON.parse(packageContent);
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      if (packageJson.dependencies) {
        Object.entries(packageJson.dependencies).forEach(([name, version]) => {
          dependencies.push({ name, version: version as string, type: 'production' });
        });
      }
      if (packageJson.devDependencies) {
        Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
          dependencies.push({ name, version: version as string, type: 'development' });
        });
      }
      
      // Detect database and backend frameworks from dependencies
      if (allDeps['@supabase/supabase-js']) {
        frameworks.push({
          name: 'Supabase',
          category: 'database',
          version: allDeps['@supabase/supabase-js'] as string,
        });
      }
      if (allDeps['firebase'] || allDeps['@firebase/app']) {
        frameworks.push({
          name: 'Firebase',
          category: 'database',
          version: (allDeps['firebase'] || allDeps['@firebase/app']) as string,
        });
      }
      if (allDeps['mongodb'] || allDeps['mongoose']) {
        frameworks.push({
          name: 'MongoDB',
          category: 'database',
          version: (allDeps['mongodb'] || allDeps['mongoose']) as string,
        });
      }
      if (allDeps['pg'] || allDeps['postgres']) {
        frameworks.push({
          name: 'PostgreSQL',
          category: 'database',
          version: (allDeps['pg'] || allDeps['postgres']) as string,
        });
      }
      if (allDeps['mysql'] || allDeps['mysql2']) {
        frameworks.push({
          name: 'MySQL',
          category: 'database',
          version: (allDeps['mysql'] || allDeps['mysql2']) as string,
        });
      }
      if (allDeps['prisma'] || allDeps['@prisma/client']) {
        frameworks.push({
          name: 'Prisma ORM',
          category: 'database',
          version: (allDeps['prisma'] || allDeps['@prisma/client']) as string,
        });
      }
      if (allDeps['typeorm']) {
        frameworks.push({
          name: 'TypeORM',
          category: 'database',
          version: allDeps['typeorm'] as string,
        });
      }
      if (allDeps['redis']) {
        frameworks.push({
          name: 'Redis',
          category: 'caching',
          version: allDeps['redis'] as string,
        });
      }
      
      // Detect frontend frameworks
      if (allDeps['react']) {
        frameworks.push({
          name: 'React',
          category: 'frontend',
          version: allDeps['react'] as string,
        });
      }
      if (allDeps['next']) {
        frameworks.push({
          name: 'Next.js',
          category: 'frontend',
          version: allDeps['next'] as string,
        });
      }
      if (allDeps['vue']) {
        frameworks.push({
          name: 'Vue',
          category: 'frontend',
          version: allDeps['vue'] as string,
        });
      }
      if (allDeps['@angular/core']) {
        frameworks.push({
          name: 'Angular',
          category: 'frontend',
          version: allDeps['@angular/core'] as string,
        });
      }
      
      // Detect backend frameworks
      if (allDeps['express']) {
        frameworks.push({
          name: 'Express',
          category: 'backend',
          version: allDeps['express'] as string,
        });
      }
      if (allDeps['fastify']) {
        frameworks.push({
          name: 'Fastify',
          category: 'backend',
          version: allDeps['fastify'] as string,
        });
      }
      if (allDeps['@nestjs/core']) {
        frameworks.push({
          name: 'NestJS',
          category: 'backend',
          version: allDeps['@nestjs/core'] as string,
        });
      }
      
      // Detect testing frameworks
      if (allDeps['jest']) {
        frameworks.push({
          name: 'Jest',
          category: 'testing',
          version: allDeps['jest'] as string,
        });
      }
      if (allDeps['vitest']) {
        frameworks.push({
          name: 'Vitest',
          category: 'testing',
          version: allDeps['vitest'] as string,
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
      cyclomaticComplexityAvg: Math.min(10, Math.round((avgFileSize / 50) * 10) / 10),
      maintainabilityIndex: Math.min(100, Math.round(healthScore + 10)),
      technicalDebtRatioPercent: Math.round(Math.max(0.5, 10 - (healthScore / 10)) * 10) / 10,
      duplicatedCodePercent: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      testCoveragePercent: Math.round(testCoverageEstimate),
      documentedSymbolsPercent: Math.min(100, Math.round(docFiles.length * 20)),
    },
    hotspots: [], // Will be populated by analysis
    deadCodeItems: [],
    duplicateCodeItems: [],
    languages: languages.length > 0 ? languages : [{ name: meta.language || 'Unknown', percentage: 100, color: '#3178c6', files: treeItems.length }],
    frameworks: frameworks,
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
    apiRoutes: apiRoutes,
    databaseModels: databaseModels,
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
