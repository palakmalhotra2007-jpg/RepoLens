/**
 * Input validation and sanitization utilities
 * 
 * Provides security-focused validation for user inputs, API keys,
 * URLs, and other external data to prevent injection attacks and
 * invalid configuration.
 * 
 * @module utils/validators
 */

/**
 * Validate URL format and protocol
 */
export function isValidUrl(url: string, allowedProtocols: string[] = ['http', 'https']): boolean {
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol.replace(':', ''));
  } catch {
    return false;
  }
}

/**
 * Validate API key format
 */
export function isValidApiKey(key: string, prefix?: string): boolean {
  if (!key || typeof key !== 'string') return false;
  if (key.trim().length < 20) return false; // Minimum length for security
  if (prefix && !key.startsWith(prefix)) return false;
  
  // Check for suspicious patterns
  if (key.includes(' ') || key.includes('\n')) return false;
  
  return true;
}

/**
 * Validate GitHub token format
 */
export function isValidGitHubToken(token: string): boolean {
  if (!token) return true; // Token is optional
  return isValidApiKey(token, 'ghp_') || isValidApiKey(token, 'github_pat_');
}

/**
 * Validate Gemini API key format
 */
export function isValidGeminiKey(key: string): boolean {
  if (!key) return false;
  return isValidApiKey(key, 'AIza');
}

/**
 * Sanitize user input for LLM prompts to prevent injection
 */
export function sanitizePrompt(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length to prevent abuse
  const MAX_PROMPT_LENGTH = 10000;
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
  }
  
  // Trim excessive whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate file path to prevent directory traversal
 */
export function isValidFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  
  // Check for directory traversal attempts
  if (path.includes('../') || path.includes('..\\')) return false;
  if (path.startsWith('/') || path.startsWith('\\')) return false;
  if (path.includes('~')) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid filename characters
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i,  // Windows reserved names
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(path));
}

/**
 * Validate repository name format
 */
export function isValidRepoName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  // GitHub repository name rules
  // - 1-100 characters
  // - Alphanumeric, hyphens, underscores, periods
  // - Cannot start with a period or hyphen
  const repoNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/;
  
  return repoNamePattern.test(name);
}

/**
 * Validate full repository identifier (owner/repo)
 */
export function isValidRepoFullName(fullName: string): boolean {
  if (!fullName || typeof fullName !== 'string') return false;
  
  const parts = fullName.split('/');
  if (parts.length !== 2) return false;
  
  const [owner, repo] = parts;
  return isValidRepoName(owner) && isValidRepoName(repo);
}

/**
 * Validate branch name format
 */
export function isValidBranchName(branch: string): boolean {
  if (!branch || typeof branch !== 'string') return false;
  
  // Git branch name rules (simplified)
  // - Cannot contain: space, ~, ^, :, ?, *, [, \
  // - Cannot start or end with /
  // - Cannot contain consecutive slashes
  // - Cannot end with .lock
  const invalidPatterns = [
    /[\s~^:?*[\]\\]/,
    /^\//,
    /\/$/,
    /\/\//,
    /\.lock$/,
    /\.$/,
    /@\{/,
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(branch));
}

/**
 * Sanitize HTML to prevent XSS (basic - for display only)
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate numeric range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= min && 
         value <= max;
}

/**
 * Validate voice settings
 */
export function validateVoiceSettings(settings: {
  rate?: number;
  pitch?: number;
  volume?: number;
}): boolean {
  const { rate, pitch, volume } = settings;
  
  if (rate !== undefined && !isInRange(rate, 0.1, 10)) return false;
  if (pitch !== undefined && !isInRange(pitch, 0, 2)) return false;
  if (volume !== undefined && !isInRange(volume, 0, 1)) return false;
  
  return true;
}

/**
 * Validate LLM provider configuration
 */
export function validateLLMConfig(config: {
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate provider
  const validProviders = ['ollama', 'gemini', 'openai', 'anthropic'];
  if (!validProviders.includes(config.provider)) {
    errors.push(`Invalid provider: ${config.provider}`);
  }
  
  // Validate base URL if provided
  if (config.baseUrl && !isValidUrl(config.baseUrl)) {
    errors.push('Invalid base URL format');
  }
  
  // Validate API key format if provided
  if (config.provider === 'gemini' && config.apiKey) {
    if (!isValidGeminiKey(config.apiKey)) {
      errors.push('Invalid Gemini API key format (should start with AIza)');
    }
  }
  
  // Validate model name
  if (config.model && (config.model.length < 2 || config.model.length > 100)) {
    errors.push('Invalid model name');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
