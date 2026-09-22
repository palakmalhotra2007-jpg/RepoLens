import { RepositoryData, FileNode } from '../types/repository';

interface SearchResult {
  file: string;
  content: string;
  relevanceScore: number;
  lineStart: number;
  lineEnd: number;
}

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Provides context-aware search and retrieval for chatbot responses
 */
export class RAGService {
  private fileIndex: Map<string, { content: string; path: string }> = new Map();
  
  /**
   * Index all files in the repository for fast searching
   */
  indexRepository(repo: RepositoryData): void {
    this.fileIndex.clear();
    this.indexFileNodes(repo.rootFiles, '');
  }

  /**
   * Recursively index file nodes
   */
  private indexFileNodes(nodes: FileNode[], parentPath: string): void {
    for (const node of nodes) {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      
      if (node.type === 'file' && node.content) {
        this.fileIndex.set(fullPath, {
          content: node.content,
          path: fullPath,
        });
      } else if (node.type === 'directory' && node.children) {
        this.indexFileNodes(node.children, fullPath);
      }
    }
  }

  /**
   * Search for relevant code snippets based on a query
   */
  searchContext(query: string, maxResults: number = 5): SearchResult[] {
    const results: SearchResult[] = [];
    const queryTerms = this.extractQueryTerms(query);

    for (const [path, fileData] of this.fileIndex.entries()) {
      const matches = this.findMatchingSnippets(
        fileData.content,
        queryTerms,
        path
      );
      results.push(...matches);
    }

    // Sort by relevance score and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  /**
   * Extract meaningful terms from query
   */
  private extractQueryTerms(query: string): string[] {
    // Convert to lowercase and split
    const terms = query.toLowerCase().split(/\s+/);
    
    // Filter out common words
    const stopWords = new Set([
      'what', 'where', 'when', 'how', 'why', 'is', 'are', 'the', 'a', 'an',
      'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this', 'that',
      'does', 'do', 'can', 'could', 'should', 'would', 'will', 'about'
    ]);
    
    return terms
      .filter(term => term.length > 2 && !stopWords.has(term))
      .slice(0, 10); // Limit to 10 terms
  }

  /**
   * Find matching snippets in file content
   */
  private findMatchingSnippets(
    content: string,
    queryTerms: string[],
    filePath: string
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const lines = content.split('\n');
    const lowerContent = content.toLowerCase();

    // Check if file path or content matches query terms
    const filePathLower = filePath.toLowerCase();
    let relevanceScore = 0;

    // Calculate base relevance from file path matching
    for (const term of queryTerms) {
      if (filePathLower.includes(term)) {
        relevanceScore += 2; // Higher weight for file path matches
      }
    }

    // Search for terms in content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();
      let lineScore = relevanceScore;

      // Count matching terms in this line
      for (const term of queryTerms) {
        if (lineLower.includes(term)) {
          lineScore += 1;
        }
      }

      // If line has matches, create a snippet with context
      if (lineScore > relevanceScore) {
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length, i + 3);
        const snippet = lines.slice(contextStart, contextEnd).join('\n');

        results.push({
          file: filePath,
          content: snippet,
          relevanceScore: lineScore,
          lineStart: contextStart + 1,
          lineEnd: contextEnd,
        });
      }
    }

    return results;
  }

  /**
   * Generate context string for AI chatbot
   */
  generateContext(query: string): string {
    const searchResults = this.searchContext(query);
    
    if (searchResults.length === 0) {
      return 'No relevant code context found in the repository.';
    }

    let context = 'Relevant code context from repository:\n\n';
    
    for (const result of searchResults) {
      context += `File: ${result.file} (Lines ${result.lineStart}-${result.lineEnd})\n`;
      context += '```\n';
      context += result.content;
      context += '\n```\n\n';
    }

    return context;
  }

  /**
   * Find files by name or pattern
   */
  findFiles(pattern: string): string[] {
    const patternLower = pattern.toLowerCase();
    const matches: string[] = [];

    for (const [path] of this.fileIndex.entries()) {
      if (path.toLowerCase().includes(patternLower)) {
        matches.push(path);
      }
    }

    return matches;
  }

  /**
   * Get file content by path
   */
  getFileContent(filePath: string): string | null {
    const file = this.fileIndex.get(filePath);
    return file ? file.content : null;
  }

  /**
   * Search for function/class definitions
   */
  findDefinitions(name: string): SearchResult[] {
    const results: SearchResult[] = [];
    const patterns = [
      new RegExp(`function\\s+${name}\\s*\\(`, 'i'),
      new RegExp(`const\\s+${name}\\s*=`, 'i'),
      new RegExp(`class\\s+${name}\\s*`, 'i'),
      new RegExp(`interface\\s+${name}\\s*`, 'i'),
      new RegExp(`type\\s+${name}\\s*=`, 'i'),
    ];

    for (const [path, fileData] of this.fileIndex.entries()) {
      const lines = fileData.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of patterns) {
          if (pattern.test(lines[i])) {
            const contextStart = Math.max(0, i - 1);
            const contextEnd = Math.min(lines.length, i + 10);
            const snippet = lines.slice(contextStart, contextEnd).join('\n');

            results.push({
              file: path,
              content: snippet,
              relevanceScore: 10, // High score for exact definition matches
              lineStart: contextStart + 1,
              lineEnd: contextEnd,
            });
          }
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get statistics about indexed repository
   */
  getIndexStats() {
    let totalLines = 0;
    let totalChars = 0;

    for (const [, fileData] of this.fileIndex.entries()) {
      totalLines += fileData.content.split('\n').length;
      totalChars += fileData.content.length;
    }

    return {
      filesIndexed: this.fileIndex.size,
      totalLines,
      totalChars,
    };
  }
}

// Singleton instance
export const ragService = new RAGService();
