import winston from 'winston';

import { getLogContext } from '../context';
import { ILogger } from '../interfaces/ILogger';

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'redBackground white',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    trace: 'magenta',
  },
};

export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;

  constructor(
    private readonly service: string,
    private readonly environment: string
  ) {
    winston.addColors(customLevels.colors);

    const enrichFormat = winston.format((info) => {
      const context = getLogContext() || {};
      info.timestamp = new Date().toISOString();
      info.service = this.service;
      info.environment = this.environment;
      info.requestId = context.requestId;
      info.correlationId = context.correlationId;
      info.traceId = context.traceId;
      info.userId = context.userId;
      info.tenantId = context.tenantId;
      info.issueId = context.issueId;
      info.operation = context.operation;
      info.duration = context.duration;
      return info;
    });

    const isDev = this.environment === 'local' || this.environment === 'development';

    this.logger = winston.createLogger({
      levels: customLevels.levels,
      level: isDev ? 'trace' : 'info',
      format: winston.format.combine(enrichFormat()),
      transports: [
        new winston.transports.Console({
          format: isDev
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.printf((info) => {
                  const correlationStr = info.correlationId ? ` [cid:${info.correlationId}]` : '';
                  const eventStr = info.event ? ` [event:${info.event}]` : '';
                  const meta = info.metadata ? ` ${JSON.stringify(info.metadata)}` : '';
                  const errStack =
                    info.error && (info.error as any).stack ? `\n${(info.error as any).stack}` : '';
                  return `[${info.timestamp}] ${info.level}: ${info.message}${correlationStr}${eventStr}${meta}${errStack}`;
                })
              )
            : winston.format.json(),
        }),
      ],
    });
  }

  private log(
    level: string,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    const metaPayload: Record<string, any> = { ...metadata };

    if (error) {
      metaPayload.error = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      };
    }

    const logObject: Record<string, any> = {
      message,
    };

    if (metadata?.event) {
      logObject.event = metadata.event;
      delete metaPayload.event;
    }

    if (Object.keys(metaPayload).length > 0) {
      logObject.metadata = metaPayload;
    }

    this.logger.log(level, logObject);
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, undefined, metadata);
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, undefined, metadata);
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, undefined, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, undefined, metadata);
  }

  public error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    this.log('error', message, error, metadata);
  }

  public fatal(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    this.log('fatal', message, error, metadata);
  }
}
