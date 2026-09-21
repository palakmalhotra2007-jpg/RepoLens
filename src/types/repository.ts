export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  symbols?: CodeSymbol[];
  modified?: boolean;
}

export interface CodeSymbol {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'variable' | 'type' | 'route' | 'schema';
  line: number;
  signature?: string;
  exported?: boolean;
  doc?: string;
}

export interface HotspotItem {
  id: string;
  file: string;
  functionName: string;
  cyclomaticComplexity: number;
  changeFrequencyScore: number;
  linesOfCode: number;
  riskScore: number; // 0 to 100
  reason: string;
}

export interface DeadCodeItem {
  id: string;
  file: string;
  symbolName: string;
  kind: 'function' | 'variable' | 'type' | 'export';
  line: number;
  confidence: number;
  estimatedSavingLines: number;
  suggestion: string;
}

export interface DuplicateCodeItem {
  id: string;
  title: string;
  similarityPercentage: number;
  linesCount: number;
  instances: {
    file: string;
    lineStart: number;
    lineEnd: number;
    snippet: string;
  }[];
  refactoringSuggestion: string;
}

export interface CodebaseMetrics {
  totalLOC: number;
  cyclomaticComplexityAvg: number;
  maintainabilityIndex: number; // 0 to 100
  technicalDebtRatioPercent: number; // e.g. 4.2%
  duplicatedCodePercent: number; // e.g. 3.1%
  testCoveragePercent: number; // e.g. 84.5%
  documentedSymbolsPercent: number; // e.g. 68%
}

export interface ArchitectureInfo {
  pattern: string;
  description: string;
  components: {
    name: string;
    role: string;
    path: string;
    technologies: string[];
  }[];
  dataFlowSummary: string;
}

export interface DependencyItem {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer';
  vulnerabilitiesCount?: number;
  description?: string;
}

export interface RepositoryData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  currentBranch: string;
  branches: string[];
  isDemo?: boolean;
  stats: {
    filesCount: number;
    linesOfCode: number;
    stars?: number;
    forks?: number;
    lastCommit: string;
    author: string;
    healthScore: number;
    securityScore: number;
    testCoverage: number;
    complexityScore: number;
  };
  metrics: CodebaseMetrics;
  hotspots: HotspotItem[];
  deadCodeItems: DeadCodeItem[];
  duplicateCodeItems: DuplicateCodeItem[];
  languages: {
    name: string;
    percentage: number;
    color: string;
    files: number;
  }[];
  frameworks: {
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'testing' | 'devops' | 'payments' | 'caching';
    version: string;
    icon: string;
  }[];
  architecture: ArchitectureInfo;
  dependencies: DependencyItem[];
  apiRoutes: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    handlerFile: string;
    handlerSymbol: string;
    authRequired: boolean;
    description: string;
  }[];
  databaseModels: {
    name: string;
    tableName: string;
    file: string;
    fieldsCount: number;
    relations: string[];
  }[];
  rootFiles: FileNode[];
}
