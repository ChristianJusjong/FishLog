import { FastifyBaseLogger } from 'fastify';

// Simple logger wrapper that can be used outside of request context
// In production, Fastify's built-in pino logger handles most logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug') && process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG]', message, data || '');
    }
  },
  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      console.log('[INFO]', message, data || '');
    }
  },
  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', message, data || '');
    }
  },
  error: (message: string, error?: unknown) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', message, error || '');
    }
  },
};

export default logger;
