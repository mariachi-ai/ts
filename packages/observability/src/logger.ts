import type { Logger } from '@mariachi/core';
import { ConfigError } from '@mariachi/core';
import { PinoLoggerAdapter } from './adapters/logging/pino';
import { ConsoleLoggerAdapter } from './adapters/logging/console';

export function createLogger(config?: { adapter?: string; level?: string; pretty?: boolean }): Logger {
  const adapter = config?.adapter ?? 'pino';
  switch (adapter) {
    case 'pino':
      return new PinoLoggerAdapter({ level: config?.level, pretty: config?.pretty });
    case 'console':
      return new ConsoleLoggerAdapter({}, config?.level);
    default:
      throw new ConfigError('observability/unknown-adapter', `Unknown logger adapter: ${adapter}`);
  }
}
