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
  const extensions: Record<string, number> = {};
  let totalLines = 0;

  allFiles.forEach(f => {
    const ext = f.name.includes('.') ? f.name.split('.').pop()?.toLowerCase() || '' : 'other';
    const lines = (f.content?.split('\n').length) || 20;
    totalLines += lines;
    extensions[ext] = (extensions[ext] || 0) + lines;
  });

  const languages = Object.entries(extensions).map(([ext, count]) => {
    let name = ext.toUpperCase();
    let color = '#6366f1';
    if (ext === 'ts' || ext === 'tsx') { name = 'TypeScript'; color = '#3178c6'; }
    else if (ext === 'js' || ext === 'jsx') { name = 'JavaScript'; color = '#f7df1e'; }
    else if (ext === 'prisma') { name = 'Prisma'; color = '#0c344b'; }
    else if (ext === 'json') { name = 'JSON'; color = '#cb171e'; }
    else if (ext === 'md') { name = 'Markdown'; color = '#083fa1'; }
    else if (ext === 'py') { name = 'Python'; color = '#3572A5'; }
    else if (ext === 'go') { name = 'Go'; color = '#00ADD8'; }
    else if (ext === 'rs') { name = 'Rust'; color = '#dea584'; }

    return {
      name,
      percentage: totalLines ? Math.round((count / totalLines) * 1000) / 10 : 0,
      color,
      files: allFiles.filter(f => f.name.endsWith('.' + ext)).length,
    };
  }).filter(l => l.percentage > 0).sort((a, b) => b.percentage - a.percentage);

  return { languages, totalLines, totalFiles: allFiles.length };
}
