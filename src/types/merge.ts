export type ConflictType = 'textual' | 'semantic' | 'schema_drift' | 'api_contract' | 'config_mismatch';

export interface MergeConflictBlock {
  id: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  conflictType: ConflictType;
  title: string;
  reason: string;
  whatConflicted: string;
  whyItConflicted: string;
  whatEachBranchChanged: {
    base: string;
    ours: string;
    theirs: string;
  };
  whyItHappened: {
    baseContext: string;
    oursIntent: string;
    theirsIntent: string;
  };
  baseCode: string;
  oursCode: string;
  theirsCode: string;
  aiSuggestedCode: string;
  resolutionStatus: 'unresolved' | 'resolved_ours' | 'resolved_theirs' | 'resolved_ai' | 'resolved_custom';
  customCode?: string;
  affectedComponents: string[];
  semanticRiskSeverity: 'critical' | 'high' | 'medium' | 'low';
  semanticImpact: string;
  resolutionSuggestion: string;
}

export interface SemanticConflictAlert {
  id: string;
  title: string;
  category: 'api_signature' | 'database_migration' | 'environment_flag' | 'auth_pipeline';
  severity: 'critical' | 'high' | 'medium';
  fileA: string;
  fileB: string;
  description: string;
  gitMergeStatus: 'git_clean_merge_with_hidden_runtime_break' | 'structural_mismatch';
  rootCause: string;
  runtimeBreakRisk: string;
  recommendedResolution: string;
  diffA: string;
  diffB: string;
}

export type ComparisonState = 'no_comparison' | 'comparing' | 'conflicts_found' | 'no_conflicts';

export interface BranchComparison {
  comparisonState: ComparisonState;
  baseBranch: string;
  currentBranch: string;
  targetBranch: string;
  aheadCount: number;
  behindCount: number;
  conflictingFilesCount: number;
  semanticConflictsCount: number;
  addedFiles: string[];
  deletedFiles: string[];
  modifiedFiles: string[];
  renamedFiles: string[];
  changedFunctions: { name: string; file: string; impact: string }[];
  changedApis: { route: string; method: string; impact: string }[];
  changedDatabaseStructures: { table: string; change: string }[];
  changedDependencies: { name: string; oldVersion: string; newVersion: string }[];
  conflicts: MergeConflictBlock[];
  semanticAlerts: SemanticConflictAlert[];
}
