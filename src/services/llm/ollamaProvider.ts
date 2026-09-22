import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig } from './types';
import { APP_CONFIG } from '../../config/constants';

export class OllamaProvider implements LLMProvider {
  readonly type = 'ollama' as const;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMProviderConfig) {
    this.baseUrl = config.baseUrl || APP_CONFIG.llm.ollama.baseUrl;
    this.model = config.model || APP_CONFIG.llm.ollama.defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.models || [];
      
      // Check if our model is available
      return models.some((m: any) => m.name === this.model || m.name.startsWith(this.model.split(':')[0]));
    } catch (error) {
      console.warn('[Ollama] Not available:', error);
      return false;
    }
  }

  async chat(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<LLMResponse> {
    try {
      // Convert messages to Ollama format
      const prompt = this.formatMessages(messages);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.maxTokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.response || '',
        model: this.model,
        provider: 'ollama',
        tokensUsed: data.eval_count || 0,
      };
    } catch (error) {
      console.error('[Ollama] Chat error:', error);
      throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessages(messages: LLMMessage[]): string {
    // Combine system and user messages into a single prompt
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    }
    
    prompt += 'Assistant: ';
    
    return prompt;
  }

  async pullModel(): Promise<void> {
    console.log(`[Ollama] Pulling model: ${this.model}`);
    
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.model,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull Ollama model: ${response.statusText}`);
    }

    console.log(`[Ollama] Model ${this.model} pulled successfully`);
  }
}
