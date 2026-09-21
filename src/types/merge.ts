export type ConflictType = 'textual' | 'semantic' | 'schema_drift' | 'api_contract' | 'config_mismatch';

export interface MergeConflictBlock {
  id: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  conflictType: ConflictType;
  title: string;
  reason: string;
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

export interface BranchComparison {
  baseBranch: string;
  currentBranch: string;
  targetBranch: string;
  aheadCount: number;
  behindCount: number;
  conflictingFilesCount: number;
  semanticConflictsCount: number;
  conflicts: MergeConflictBlock[];
  semanticAlerts: SemanticConflictAlert[];
}
