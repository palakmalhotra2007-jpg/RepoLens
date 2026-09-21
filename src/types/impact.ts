export type DependencyNodeType = 'file' | 'function' | 'api' | 'database' | 'test' | 'service';

export interface GraphNodeData extends Record<string, unknown> {
  label: string;
  sublabel?: string;
  type: DependencyNodeType;
  path: string;
  symbol?: string;
  riskScore?: number; // 0 to 100
  isDirectTarget?: boolean;
  isImpacted?: boolean;
  impactLevel?: 'direct' | 'first_degree' | 'second_degree' | 'unaffected';
  details?: {
    linesOfCode?: number;
    callCount?: number;
    testCoverage?: number;
    dependentsCount?: number;
    dependenciesCount?: number;
    description?: string;
  };
}

export interface BlastRadiusResult {
  targetNodeId: string;
  targetLabel: string;
  riskScore: number;
  overallRiskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactSummary: string;
  affectedFiles: string[];
  affectedRoutes: string[];
  affectedComponents: string[];
  affectedDbTables: string[];
  affectedTests: string[];
  suggestedValidationSteps: string[];
}

export interface ChangePlanStep {
  stepNumber: number;
  title: string;
  category: 'database_migration' | 'backend_service' | 'api_route' | 'frontend_ui' | 'testing' | 'config';
  targetFile: string;
  action: 'create' | 'modify' | 'deprecate' | 'add_test';
  summary: string;
  codeSnippet: string;
  suggestedDiff?: string;
}

export interface FeatureChangePlan {
  id: string;
  userPrompt: string;
  featureTitle: string;
  estimatedEffort: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  architecturalOverview: string;
  impactedLayers: string[];
  steps: ChangePlanStep[];
  requiredTests: string[];
  securityConsiderations: string[];
}
