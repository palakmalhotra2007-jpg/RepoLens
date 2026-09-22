import { FileNode, CodeSymbol, RepositoryData } from '../types/repository';

export function flattenFileTree(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  function traverse(list: FileNode[]) {
    for (const node of list) {
      if (node.type === 'file') {
        result.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return result;
}

export function findFileByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function extractCodeSymbols(filename: string, content: string): CodeSymbol[] {
  const symbols: CodeSymbol[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Match Functions: export function name(..) / const name = () => / function name(..)
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/) ||
                      trimmed.match(/^(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=>]+)?\s*=>/);
    if (funcMatch) {
      symbols.push({
        name: funcMatch[1],
        kind: 'function',
        line: lineNum,
        signature: trimmed.slice(0, 70),
        exported: trimmed.startsWith('export'),
      });
      return;
    }

    // Match Classes
    const classMatch = trimmed.match(/^(?:export\s+)?class\s+([a-zA-Z0-9_$]+)/);
    if (classMatch) {
      symbols.push({
        name: classMatch[1],
        kind: 'class',
        line: lineNum,
        signature: trimmed.slice(0, 60),
        exported: trimmed.startsWith('export'),
      });
      return;
    }

    // Match Interfaces & Types
    const interfaceMatch = trimmed.match(/^(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/);
    if (interfaceMatch) {
      symbols.push({
        name: interfaceMatch[1],
        kind: 'interface',
        line: lineNum,
        exported: trimmed.startsWith('export'),
      });
      return;
    }

    const typeMatch = trimmed.match(/^(?:export\s+)?type\s+([a-zA-Z0-9_$]+)\s*=/);
    if (typeMatch) {
      symbols.push({
        name: typeMatch[1],
        kind: 'type',
        line: lineNum,
        exported: trimmed.startsWith('export'),
      });
      return;
    }

    // Match Prisma Model
    const prismaMatch = trimmed.match(/^model\s+([a-zA-Z0-9_$]+)\s+\{/);
    if (prismaMatch) {
      symbols.push({
        name: prismaMatch[1],
        kind: 'schema',
        line: lineNum,
      });
      return;
    }

    // Match Express / API Route
    const routeMatch = trimmed.match(/(?:app|router|[a-zA-Z]+Router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/i);
    if (routeMatch) {
      symbols.push({
        name: `${routeMatch[1].toUpperCase()} ${routeMatch[2]}`,
        kind: 'route',
        line: lineNum,
      });
    }
  });

  return symbols;
}

export function detectTechStack(files: FileNode[]) {
  const allFiles = flattenFileTree(files);
  const langTotals: Record<string, { count: number; color: string; files: number }> = {};
  let totalLines = 0;

  // Ignore non-code assets and config clutter
  const ignoredExts = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'bmp',
    'woff', 'woff2', 'ttf', 'eot', 'otf',
    'lock', 'gitignore', 'npmrc', 'prettierrc', 'eslintcache', 'ds_store',
    'map', 'mp3', 'mp4', 'pdf', 'zip', 'tar', 'gz'
  ]);

  allFiles.forEach(f => {
    if (f.type !== 'file') return;
    const ext = f.name.includes('.') ? f.name.split('.').pop()?.toLowerCase() || '' : '';
    if (!ext || ignoredExts.has(ext)) return;

    let langName = ext.toUpperCase();
    let color = '#6366f1';

    if (ext === 'ts' || ext === 'tsx') { langName = 'TypeScript'; color = '#3178c6'; }
    else if (ext === 'js' || ext === 'jsx' || ext === 'mjs' || ext === 'cjs') { langName = 'JavaScript'; color = '#f7df1e'; }
    else if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') { langName = 'CSS'; color = '#563d7c'; }
    else if (ext === 'html') { langName = 'HTML'; color = '#e34c26'; }
    else if (ext === 'json') { langName = 'JSON'; color = '#cb171e'; }
    else if (ext === 'prisma') { langName = 'Prisma'; color = '#0c344b'; }
    else if (ext === 'py') { langName = 'Python'; color = '#3572A5'; }
    else if (ext === 'go') { langName = 'Go'; color = '#00ADD8'; }
    else if (ext === 'rs') { langName = 'Rust'; color = '#dea584'; }
    else if (ext === 'java') { langName = 'Java'; color = '#b07219'; }
    else if (ext === 'cpp' || ext === 'cc' || ext === 'cxx') { langName = 'C++'; color = '#f34b7d'; }
    else if (ext === 'c' || ext === 'h') { langName = 'C'; color = '#555555'; }
    else if (ext === 'sql') { langName = 'SQL'; color = '#e38c00'; }
    else if (ext === 'sh' || ext === 'bash') { langName = 'Shell'; color = '#89e051'; }
    else if (ext === 'md' || ext === 'mdx') { langName = 'Markdown'; color = '#083fa1'; }
    else if (ext === 'vue') { langName = 'Vue'; color = '#41b883'; }
    else if (ext === 'svelte') { langName = 'Svelte'; color = '#ff3e00'; }

    const lines = f.content?.split('\n').length || 25;
    totalLines += lines;

    if (!langTotals[langName]) {
      langTotals[langName] = { count: 0, color, files: 0 };
    }
    langTotals[langName].count += lines;
    langTotals[langName].files += 1;
  });

  const languages = Object.entries(langTotals)
    .map(([name, data]) => ({
      name,
      percentage: totalLines ? Math.round((data.count / totalLines) * 1000) / 10 : 0,
      color: data.color,
      files: data.files,
    }))
    .filter(l => l.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return { languages, totalLines, totalFiles: allFiles.length };
}
