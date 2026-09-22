import { LLMProvider, LLMProviderType, LLMProviderConfig, LLMProviderStatus, LLMMessage, LLMResponse } from './types';
import { OllamaProvider } from './ollamaProvider';
import { GeminiProvider } from './geminiProvider';
import { APP_CONFIG } from '../../config/constants';

/**
 * LLM Service - Manages multiple LLM providers with Ollama and Gemini
 */
export class LLMService {
  private providers: Map<LLMProviderType, LLMProvider> = new Map();
  private activeProvider: LLMProviderType = (APP_CONFIG.llm.defaultProvider as LLMProviderType) || 'ollama';
  private statusCache: LLMProviderStatus | null = null;
  private lastStatusCheck: number = 0;
  private readonly STATUS_CACHE_TTL = 10000; // 10 seconds TTL

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Ollama
    const ollamaProvider = new OllamaProvider({
      type: 'ollama',
      baseUrl: APP_CONFIG.llm.ollama.baseUrl,
      model: APP_CONFIG.llm.ollama.defaultModel,
    });
    this.providers.set('ollama', ollamaProvider);

    // Initialize Gemini
    const geminiProvider = new GeminiProvider({
      type: 'gemini',
      apiKey: APP_CONFIG.llm.gemini.apiKey,
      model: APP_CONFIG.llm.gemini.defaultModel,
    });
    this.providers.set('gemini', geminiProvider);
  }

  /**
   * Check status of all providers
   */
  async checkProviderStatus(forceRefresh = false): Promise<LLMProviderStatus> {
    const now = Date.now();
    if (!forceRefresh && this.statusCache && (now - this.lastStatusCheck) < this.STATUS_CACHE_TTL) {
      return this.statusCache;
    }

    const ollamaProvider = this.providers.get('ollama');
    const geminiProvider = this.providers.get('gemini');

    const [ollamaAvailable, geminiAvailable] = await Promise.all([
      ollamaProvider?.isAvailable().catch(() => false) ?? Promise.resolve(false),
      geminiProvider?.isAvailable().catch(() => false) ?? Promise.resolve(false),
    ]);

    this.statusCache = {
      ollama: {
        available: !!ollamaAvailable,
        model: APP_CONFIG.llm.ollama.defaultModel,
        error: ollamaAvailable ? undefined : 'Ollama is not responding or target model not found',
      },
      gemini: {
        available: !!geminiAvailable,
        model: APP_CONFIG.llm.gemini.defaultModel,
        hasApiKey: !!APP_CONFIG.llm.gemini.apiKey,
        error: geminiAvailable ? undefined : !APP_CONFIG.llm.gemini.apiKey ? 'API key not configured' : 'Gemini API not reachable',
      },
    };

    this.lastStatusCheck = now;
    return this.statusCache;
  }

  /**
   * Set active provider
   */
  async setProvider(type: LLMProviderType): Promise<boolean> {
    const provider = this.providers.get(type);
    if (!provider) {
      console.error(`[LLMService] Provider ${type} not found`);
      return false;
    }

    const available = await provider.isAvailable().catch(() => false);
    if (!available) {
      console.warn(`[LLMService] Provider ${type} is not currently responding`);
      // Still set it so user preferences are respected, but log warning
    }

    this.activeProvider = type;
    console.log(`[LLMService] Active provider set to: ${type}`);
    return true;
  }

  /**
   * Get current active provider
   */
  getActiveProvider(): LLMProviderType {
    return this.activeProvider;
  }

  /**
   * Auto-select best available provider
   */
  async autoSelectProvider(): Promise<LLMProviderType> {
    const status = await this.checkProviderStatus(true);
    
    // Check preferred active provider first
    const preferred = this.providers.get(this.activeProvider);
    if (preferred && (await preferred.isAvailable().catch(() => false))) {
      return this.activeProvider;
    }

    // Fallback: Check Ollama
    if (status.ollama.available) {
      this.activeProvider = 'ollama';
      return 'ollama';
    }
    
    // Fallback: Check Gemini
    if (status.gemini.available) {
      this.activeProvider = 'gemini';
      return 'gemini';
    }
    
    return this.activeProvider;
  }

  /**
   * Send chat request to active provider with auto-fallback
   */
  async chat(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    preferredProvider?: LLMProviderType;
  }): Promise<LLMResponse> {
    const targetType = options?.preferredProvider || this.activeProvider;
    let primaryProvider = this.providers.get(targetType);
    let secondaryType: LLMProviderType = targetType === 'ollama' ? 'gemini' : 'ollama';
    let secondaryProvider = this.providers.get(secondaryType);

    // Try primary provider
    if (primaryProvider) {
      try {
        const isAvail = await primaryProvider.isAvailable();
        if (isAvail) {
          return await primaryProvider.chat(messages, options);
        }
      } catch (primaryErr) {
        console.warn(`[LLMService] Primary provider (${targetType}) failed, trying fallback:`, primaryErr);
      }
    }

    // Try secondary provider as fallback
    if (secondaryProvider) {
      try {
        const isAvail = await secondaryProvider.isAvailable();
        if (isAvail) {
          console.log(`[LLMService] Falling back to secondary provider (${secondaryType})`);
          return await secondaryProvider.chat(messages, options);
        }
      } catch (secondaryErr) {
        console.warn(`[LLMService] Secondary provider (${secondaryType}) failed:`, secondaryErr);
      }
    }

    // If both failed, try one direct attempt with primary to capture detailed error message
    if (primaryProvider) {
      return await primaryProvider.chat(messages, options);
    }

    throw new Error('No LLM provider available. Please check Ollama connection or configure your Gemini API key.');
  }

  /**
   * Get Ollama provider for pulling models
   */
  getOllamaProvider(): OllamaProvider | null {
    return this.providers.get('ollama') as OllamaProvider || null;
  }
}

// Singleton instance
export const llmService = new LLMService();
