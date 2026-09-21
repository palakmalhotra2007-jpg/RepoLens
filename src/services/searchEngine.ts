import { FileNode } from '../types/repository';
import { SearchResultItem } from '../types/chat';
import { flattenFileTree } from './repoParser';

export function searchRepositoryCode(rootNodes: FileNode[], query: string): SearchResultItem[] {
  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const allFiles = flattenFileTree(rootNodes);
  const results: SearchResultItem[] = [];

  for (const file of allFiles) {
    // 1. Filename match
    if (file.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        file: file.path,
        line: 1,
        content: file.path,
        matchType: 'filename',
        score: file.name.toLowerCase() === lowerQuery ? 100 : 80,
      });
    }

    // 2. Symbol match
    if (file.symbols) {
      for (const sym of file.symbols) {
        if (sym.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            file: file.path,
            line: sym.line,
            content: `${sym.kind.toUpperCase()} ${sym.name} — ${sym.signature || ''}`,
            matchType: 'symbol',
            score: sym.name.toLowerCase() === lowerQuery ? 95 : 75,
          });
        }
      }
    }

    // 3. Full Content line search
    if (file.content) {
      const lines = file.content.split('\n');
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(lowerQuery)) {
          const lineNum = idx + 1;
          // Avoid duplicate entry if symbol already captured it
          const alreadyMatched = results.some(r => r.file === file.path && r.line === lineNum);
          if (!alreadyMatched && results.length < 50) {
            results.push({
              file: file.path,
              line: lineNum,
              content: lineText.trim(),
              matchType: 'content',
              score: 50,
              previewBefore: lines.slice(Math.max(0, idx - 1), idx).map(l => l.trim()),
              previewAfter: lines.slice(idx + 1, Math.min(lines.length, idx + 2)).map(l => l.trim()),
            });
          }
        }
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score).slice(0, 30);
}
