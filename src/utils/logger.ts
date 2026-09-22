/**
 * Centralized logging utility for RepoLens
 * 
 * Features:
 * - Environment-aware logging (disabled in production by default)
 * - Structured log levels (debug, info, warn, error)
 * - Contextual prefixes for better debugging
 * - Performance timing utilities
 * 
 * @module utils/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  showTimestamps: boolean;
}

class Logger {
  private config: LoggerConfig;
  private timers: Map<string, number>;

  constructor() {
    // Only enable logging in development mode
    this.config = {
      enabled: import.meta.env.DEV,
      level: 'debug',
      showTimestamps: true,
    };
    this.timers = new Map();
  }

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log debug information (development only)
   */
  debug(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format(context, message), ...args);
    }
  }

  /**
   * Log general information
   */
  info(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format(context, message), ...args);
    }
  }

  /**
   * Log warnings
   */
  warn(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format(context, message), ...args);
    }
  }

  /**
   * Log errors (always logged, even in production)
   */
  error(context: string, message: string, error?: Error | unknown): void {
    // Errors are always logged
    console.error(this.format(context, message), error);
  }

  /**
   * Start a performance timer
   */
  timeStart(label: string): void {
    if (this.config.enabled) {
      this.timers.set(label, performance.now());
    }
  }

  /**
   * End a performance timer and log the duration
   */
  timeEnd(context: string, label: string): void {
    if (this.config.enabled) {
      const start = this.timers.get(label);
      if (start) {
        const duration = (performance.now() - start).toFixed(2);
        this.debug(context, `${label} completed in ${duration}ms`);
        this.timers.delete(label);
      }
    }
  }

  /**
   * Format log message with context and timestamp
   */
  private format(context: string, message: string): string {
    const timestamp = this.config.showTimestamps
      ? `[${new Date().toISOString().split('T')[1].split('.')[0]}]`
      : '';
    return `${timestamp} [${context}] ${message}`;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex >= currentLevelIndex;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods for common contexts
export const logVoice = {
  debug: (msg: string, ...args: any[]) => logger.debug('Voice', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Voice', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('Voice', msg, ...args),
  error: (msg: string, err?: any) => logger.error('Voice', msg, err),
};

export const logRAG = {
  debug: (msg: string, ...args: any[]) => logger.debug('RAG', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('RAG', msg, ...args),
};

export const logLLM = {
  debug: (msg: string, ...args: any[]) => logger.debug('LLM', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('LLM', msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn('LLM', msg, ...args),
  error: (msg: string, err?: any) => logger.error('LLM', msg, err),
};

export const logFile = {
  debug: (msg: string, ...args: any[]) => logger.debug('FileLoader', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('FileLoader', msg, ...args),
  error: (msg: string, err?: any) => logger.error('FileLoader', msg, err),
};

export const logChat = {
  debug: (msg: string, ...args: any[]) => logger.debug('Chat', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Chat', msg, ...args),
};

export const logImpact = {
  debug: (msg: string, ...args: any[]) => logger.debug('Impact Graph', msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info('Impact Graph', msg, ...args),
};

export const logSettings = {
  debug: (msg: string, ...args: any[]) => logger.debug('Settings', msg, ...args),
  error: (msg: string, err?: any) => logger.error('Settings', msg, err),
};
