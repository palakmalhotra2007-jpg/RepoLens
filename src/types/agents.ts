import { AgentVoiceProfile } from './voice';

export type AgentId = 
  | 'code_quality_arch'
  | 'code_quality'
  | 'security'
  | 'performance_db'
  | 'testing_reliability'
  | 'git_merge'
  | 'orchestrator'
  | 'final_reviewer';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ReviewState = 'not_started' | 'running' | 'debating' | 'consensus' | 'completed';

export type DebateStage = 
  | 'independent_analysis'
  | 'cross_agent_challenge'
  | 'debate_rebuttal'
  | 'evidence_verification'
  | 'consensus_ruling';

export interface AgentProfile {
  id: AgentId;
  name: string;
  shortName: string;
  role: string;
  avatar: string;
  color: string;
  accentBg: string;
  badgeBorder: string;
  description: string;
  focusAreas: string[];
  voicePersona: {
    pitch: number;
    rate: number;
    tone: string;
    sampleIntro: string;
  };
}

export interface DebateStageItem {
  stage: DebateStage;
  stageNumber: number;
  stageTitle: string;
  agentId: AgentId;
  agentName: string;
  timestamp: string;
  argumentText: string;
  audioSpeechText: string; // The text spoken aloud when playing audio debate
  evidenceCode?: string;
  evidenceTokens?: string[];
  stance: 'flagged' | 'agree' | 'disagree_challenge' | 'verified' | 'ruling';
  confidenceDelta?: number; // e.g. +5% or -10%
}

export interface ReviewFinding {
  id: string;
  title: string;
  severity: SeverityLevel;
  primaryAgent: AgentId;
  agentsInvolved: AgentId[];
  confidence: number; // 0 to 100
  file: string;
  lineRange: { start: number; end: number };
  evidence: string;
  affectedComponents: string[];
  suggestedResolution: string;
  originalCodeSnippet: string;
  fixedCodeSnippet: string;
  status: 'open' | 'resolved' | 'dismissed';
  impactSummary: string;
  ruleId: string;
  cweOrStandard?: string;
  audioBriefingScript: string; // Spoken aloud by primary agent
  debateStages: DebateStageItem[];
  agreementMatrix: {
    agentId: AgentId;
    agentName: string;
    vote: 'agree' | 'disagree' | 'neutral';
    reasonSummary: string;
  }[];
}

export interface OrchestrationSummary {
  totalIssuesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  crossAgentVerifications: number;
  challengesResolved: number;
  overallHealthScore: number;
  readinessVerdict: 'ready_to_merge' | 'needs_critical_fixes' | 'review_required';
  finalReviewerNotes: string;
  orchestratorAudioSummary: string;
}
