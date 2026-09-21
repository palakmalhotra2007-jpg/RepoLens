import { AgentId } from './agents';

export type JumpTargetType = 'code' | 'finding' | 'impact_node' | 'merge_conflict' | 'debate';

export interface JumpAction {
  label: string;
  type: JumpTargetType;
  targetId: string; // filePath, findingId, nodeId, or conflictId
  line?: number;
  description?: string;
}

export interface CodeReference {
  file: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  symbolName?: string;
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  respondingAgentId?: AgentId;
  content: string;
  timestamp: string;
  codeReferences?: CodeReference[];
  jumpActions?: JumpAction[];
  audioSpokenText?: string;
  isAudioPlaying?: boolean;
}

export interface SearchResultItem {
  file: string;
  line: number;
  content: string;
  matchType: 'symbol' | 'content' | 'route' | 'schema' | 'filename';
  score: number;
  previewBefore?: string[];
  previewAfter?: string[];
}
