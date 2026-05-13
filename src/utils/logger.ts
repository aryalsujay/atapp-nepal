/**
 * Lightweight logger — replaces direct `console.*` calls.
 *
 * - In dev (`__DEV__`): logs to the JS console with a scoped prefix.
 * - In production: silent for `debug` + `info`; surfaces `warn` + `error` to the
 *   JS console (Sentry / Crashlytics integration would go here).
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.warn('[teachersStore]', 'failed to hydrate', err);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function emit(level: LogLevel, args: unknown[]) {
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  if (!isDev && (level === 'debug' || level === 'info')) return;

  // eslint-disable-next-line no-console
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  sink(...args);
}

export const logger = {
  debug: (...args: unknown[]) => emit('debug', args),
  info: (...args: unknown[]) => emit('info', args),
  warn: (...args: unknown[]) => emit('warn', args),
  error: (...args: unknown[]) => emit('error', args),
};
