import { LLMProvider, LLMMessage, LLMResponse, LLMProviderConfig } from './types';
import { APP_CONFIG } from '../../config/constants';

export class GeminiProvider implements LLMProvider {
  readonly type = 'gemini' as const;
  private apiKey: string;
  private model: string;
  private baseUrl = APP_CONFIG.llm.gemini.baseUrl;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey || APP_CONFIG.llm.gemini.apiKey;
    this.model = config.model || APP_CONFIG.llm.gemini.defaultModel;
    
    if (!this.apiKey) {
      console.warn('[Gemini] No API key configured. Gemini will not be available.');
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      // Quick validation - check if API key is valid format
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        }
      );
      
      return response.ok;
    } catch (error) {
      console.warn('[Gemini] Not available:', error);
      return false;
    }
  }

  async chat(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const contents = this.formatMessages(messages);
      
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options?.temperature || 0.7,
              maxOutputTokens: options?.maxTokens || 2048,
              topP: 0.95,
              topK: 40,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const content = data.candidates[0]?.content?.parts?.[0]?.text || '';
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

      return {
        content,
        model: this.model,
        provider: 'gemini',
        tokensUsed,
      };
    } catch (error) {
      console.error('[Gemini] Chat error:', error);
      throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessages(messages: LLMMessage[]): any[] {
    const contents: any[] = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        // Gemini doesn't have a system role, prepend to first user message
        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: msg.content }],
          });
        } else {
          contents[0].parts[0].text = `${msg.content}\n\n${contents[0].parts[0].text}`;
        }
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    
    return contents;
  }
}
