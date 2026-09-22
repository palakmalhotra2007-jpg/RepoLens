import { RepositoryData } from '../types/repository';

/**
 * Default empty repository state
 * Used when no repository is loaded
 */
export const createEmptyRepository = (): RepositoryData => ({
  id: 'empty',
  name: 'No Repository Loaded',
  fullName: '',
  description: 'Connect a repository to get started',
  defaultBranch: 'main',
  currentBranch: 'main',
  branches: ['main'],
  isDemo: false,
  stats: {
    filesCount: 0,
    linesOfCode: 0,
    stars: 0,
    forks: 0,
    lastCommit: new Date().toLocaleDateString(),
    author: '',
    healthScore: 0,
    securityScore: 0,
    testCoverage: 0,
    complexityScore: 0,
  },
  metrics: {
    totalLOC: 0,
    cyclomaticComplexityAvg: 0,
    maintainabilityIndex: 0,
    technicalDebtRatioPercent: 0,
    duplicatedCodePercent: 0,
    testCoveragePercent: 0,
    documentedSymbolsPercent: 0,
  },
  hotspots: [],
  deadCodeItems: [],
  duplicateCodeItems: [],
  languages: [],
  frameworks: [],
  architecture: {
    pattern: 'Unknown',
    description: 'Load a repository to analyze architecture',
    components: [],
    dataFlowSummary: 'No data available',
  },
  dependencies: [],
  apiRoutes: [],
  databaseModels: [],
  rootFiles: [],
});

/**
 * Empty branch comparison state
 */
export const createEmptyBranchComparison = (): import('../types/merge').BranchComparison => ({
  comparisonState: 'no_comparison',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'main',
  aheadCount: 0,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [],
  deletedFiles: [],
  modifiedFiles: [],
  renamedFiles: [],
  changedFunctions: [],
  changedApis: [],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [],
});
