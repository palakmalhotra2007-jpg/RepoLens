// LLM Provider Types and Interfaces

export type LLMProviderType = 'ollama' | 'gemini';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProviderType;
  tokensUsed?: number;
}

export interface LLMProviderConfig {
  type: LLMProviderType;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  readonly type: LLMProviderType;
  readonly isAvailable: () => Promise<boolean>;
  chat(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<LLMResponse>;
}

export interface LLMProviderStatus {
  ollama: {
    available: boolean;
    model: string;
    error?: string;
  };
  gemini: {
    available: boolean;
    model: string;
    hasApiKey: boolean;
    error?: string;
  };
}
