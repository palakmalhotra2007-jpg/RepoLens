import { LLMProvider, LLMProviderType, LLMProviderConfig, LLMProviderStatus, LLMMessage, LLMResponse } from './types';
import { OllamaProvider } from './ollamaProvider';
import { GeminiProvider } from './geminiProvider';
import { APP_CONFIG } from '../../config/constants';

/**
 * LLM Service - Manages multiple LLM providers with Ollama as default
 */
export class LLMService {
  private providers: Map<LLMProviderType, LLMProvider> = new Map();
  private activeProvider: LLMProviderType = APP_CONFIG.llm.defaultProvider as LLMProviderType;
  private statusCache: LLMProviderStatus | null = null;
  private lastStatusCheck: number = 0;
  private readonly STATUS_CACHE_TTL = APP_CONFIG.api.timeout; // Use API timeout

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Ollama (default, always available if running)
    const ollamaProvider = new OllamaProvider({
      type: 'ollama',
      baseUrl: APP_CONFIG.llm.ollama.baseUrl,
      model: APP_CONFIG.llm.ollama.defaultModel,
    });
    this.providers.set('ollama', ollamaProvider);

    // Initialize Gemini (optional, requires API key)
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
  async checkProviderStatus(): Promise<LLMProviderStatus> {
    // Return cached status if recent
    const now = Date.now();
    if (this.statusCache && (now - this.lastStatusCheck) < this.STATUS_CACHE_TTL) {
      return this.statusCache;
    }

    const ollamaProvider = this.providers.get('ollama');
    const geminiProvider = this.providers.get('gemini');

    const [ollamaAvailable, geminiAvailable] = await Promise.all([
      ollamaProvider?.isAvailable() || Promise.resolve(false),
      geminiProvider?.isAvailable() || Promise.resolve(false),
    ]);

    this.statusCache = {
      ollama: {
        available: ollamaAvailable,
        model: APP_CONFIG.llm.ollama.defaultModel,
        error: ollamaAvailable ? undefined : 'Ollama is not running or model not installed',
      },
      gemini: {
        available: geminiAvailable,
        model: APP_CONFIG.llm.gemini.defaultModel,
        hasApiKey: !!APP_CONFIG.llm.gemini.apiKey,
        error: geminiAvailable ? undefined : !APP_CONFIG.llm.gemini.apiKey ? 'API key not configured' : 'API error',
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

    const available = await provider.isAvailable();
    if (!available) {
      console.warn(`[LLMService] Provider ${type} is not available`);
      return false;
    }

    this.activeProvider = type;
    console.log(`[LLMService] Switched to provider: ${type}`);
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
    const status = await this.checkProviderStatus();
    
    // Prefer Ollama (local, free)
    if (status.ollama.available) {
      this.activeProvider = 'ollama';
      return 'ollama';
    }
    
    // Fallback to Gemini if available
    if (status.gemini.available) {
      this.activeProvider = 'gemini';
      return 'gemini';
    }
    
    // No providers available
    console.error('[LLMService] No LLM providers available');
    return 'ollama'; // Default even if not available
  }

  /**
   * Send chat request to active provider
   */
  async chat(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    preferredProvider?: LLMProviderType;
  }): Promise<LLMResponse> {
    let provider = this.providers.get(options?.preferredProvider || this.activeProvider);
    
    // If preferred provider not available, try active provider
    if (!provider || !(await provider.isAvailable())) {
      await this.autoSelectProvider();
      provider = this.providers.get(this.activeProvider);
    }

    if (!provider) {
      throw new Error('No LLM provider available. Please install Ollama or configure Gemini API key.');
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error(`${provider.type} is not available. Please check your configuration.`);
    }

    return provider.chat(messages, options);
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
