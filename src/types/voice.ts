import { AgentId } from './agents';

export interface AgentVoiceProfile {
  agentId: AgentId;
  voiceName?: string;
  pitch: number;    // 0.5 to 1.5
  rate: number;     // 0.8 to 1.4
  lang: string;     // e.g. 'en-US'
  gender: 'male' | 'female' | 'neutral';
  toneDescription: string;
}

export interface VoiceSettings {
  enabled: boolean;
  autoPlayResponses: boolean;
  provider: 'webspeech' | 'openai' | 'elevenlabs';
  globalVolume: number; // 0 to 1
  agentProfiles: Record<AgentId, AgentVoiceProfile>;
  elevenLabsApiKey?: string;
  openAiApiKey?: string;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  speakingAgentId: AgentId | null;
  currentText: string | null;
  progressPercent: number;
}
