// Application configuration constants
export const APP_CONFIG = {
  // Application metadata
  name: import.meta.env.VITE_APP_NAME || 'RepoLens',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Repository Analysis Tool',

  // API Configuration
  api: {
    github: {
      baseUrl: import.meta.env.VITE_GITHUB_API_BASE || 'https://api.github.com',
      rawBaseUrl: import.meta.env.VITE_GITHUB_RAW_BASE || 'https://raw.githubusercontent.com',
      token: import.meta.env.VITE_GITHUB_TOKEN || '',
    },
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },

  // LLM Configuration
  llm: {
    defaultProvider: import.meta.env.VITE_LLM_PROVIDER || import.meta.env.VITE_DEFAULT_LLM_PROVIDER || 'ollama',
    ollama: {
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5:3b',
      enabled: import.meta.env.VITE_OLLAMA_ENABLED !== 'false',
    },
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      defaultModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest',
      baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    },
  },

  // Analysis limits
  analysis: {
    maxFiles: parseInt(import.meta.env.VITE_MAX_FILES_TO_ANALYZE || '50'),
    maxFileSizeKB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_KB || '500'),
    maxLinesOfCode: parseInt(import.meta.env.VITE_MAX_LINES_OF_CODE || '1000000'),
  },

  // UI Configuration
  ui: {
    defaultView: (import.meta.env.VITE_DEFAULT_VIEW as any) || 'overview',
    animationDuration: parseInt(import.meta.env.VITE_ANIMATION_DURATION || '300'),
  },

  // Local development defaults
  dev: {
    serverPort: parseInt(import.meta.env.VITE_DEV_SERVER_PORT || '4000'),
    clientPort: parseInt(import.meta.env.VITE_DEV_CLIENT_PORT || '5173'),
    clientOrigin: import.meta.env.VITE_CLIENT_ORIGIN || 'http://localhost:5173',
    serverUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  },

  // Chat & AI Configuration
  chat: {
    defaultAgent: (import.meta.env.VITE_DEFAULT_CHAT_AGENT as any) || 'orchestrator',
    maxMessages: parseInt(import.meta.env.VITE_MAX_CHAT_MESSAGES || '100'),
    responseDelay: parseInt(import.meta.env.VITE_CHAT_RESPONSE_DELAY || '350'),
    welcomeMessage: import.meta.env.VITE_WELCOME_MESSAGE || 'Engineering Intelligence ready for analysis.',
  },

  // Voice Configuration
  voice: {
    defaultEnabled: import.meta.env.VITE_VOICE_ENABLED === 'true',
    defaultRate: parseFloat(import.meta.env.VITE_VOICE_RATE || '0.95'), // Slightly slower for clarity
    defaultPitch: parseFloat(import.meta.env.VITE_VOICE_PITCH || '1.0'),
    defaultVolume: parseFloat(import.meta.env.VITE_VOICE_VOLUME || '1.0'), // Full volume for clarity
  },

  // Security Configuration
  security: {
    rateLimit: {
      windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '60000'),
      maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX || '100'),
    },
  },
} as const;

// Message templates
export const MESSAGES = {
  timestamps: {
    justNow: import.meta.env.VITE_TIMESTAMP_JUST_NOW || 'Just now',
    loading: import.meta.env.VITE_TIMESTAMP_LOADING || 'Loading...',
  },
  
  errors: {
    repoNotFound: import.meta.env.VITE_ERROR_REPO_NOT_FOUND || 'Repository not found or is private.',
    loadFailed: import.meta.env.VITE_ERROR_LOAD_FAILED || 'Failed to load file from GitHub',
    reviewFailed: import.meta.env.VITE_ERROR_REVIEW_FAILED || 'Review failed. Please ensure your LLM service is configured.',
    llmNotConfigured: import.meta.env.VITE_ERROR_LLM_NOT_CONFIGURED || 'Please ensure Ollama is running or Gemini API key is configured.',
  },

  success: {
    reviewComplete: import.meta.env.VITE_SUCCESS_REVIEW_COMPLETE || 'Review completed successfully',
    conflictResolved: import.meta.env.VITE_SUCCESS_CONFLICT_RESOLVED || 'Conflict resolved',
    fixApplied: import.meta.env.VITE_SUCCESS_FIX_APPLIED || 'Fix applied successfully',
  },

  placeholders: {
    noDescription: import.meta.env.VITE_PLACEHOLDER_NO_DESCRIPTION || 'No description provided',
    noContent: import.meta.env.VITE_PLACEHOLDER_NO_CONTENT || 'No content available',
    unknownError: import.meta.env.VITE_PLACEHOLDER_UNKNOWN_ERROR || 'Unknown error',
  },
} as const;

// Agent configuration
export const AGENT_CONFIG = {
  defaultAgentId: (import.meta.env.VITE_DEFAULT_AGENT_ID as any) || 'orchestrator',
  orchestrator: {
    name: import.meta.env.VITE_ORCHESTRATOR_NAME || 'Review Orchestrator',
    shortName: import.meta.env.VITE_ORCHESTRATOR_SHORT_NAME || 'Orchestrator',
    avatar: import.meta.env.VITE_ORCHESTRATOR_AVATAR || '👑',
  },
} as const;