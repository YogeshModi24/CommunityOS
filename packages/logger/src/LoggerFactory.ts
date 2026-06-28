import { ConsoleLogger } from './adapters/ConsoleLogger';
import { WinstonLogger } from './adapters/WinstonLogger';
import { ILogger } from './interfaces/ILogger';

export type LoggerProvider = 'console' | 'winston';

export class LoggerFactory {
  public static createLogger(
    provider: LoggerProvider,
    serviceName: string,
    environment: string
  ): ILogger {
    if (provider === 'winston') {
      return new WinstonLogger(serviceName, environment);
    }
    return new ConsoleLogger(serviceName, environment);
  }
}
