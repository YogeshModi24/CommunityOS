/* eslint-disable no-console */
import { getLogContext } from '../context';
import { ILogger } from '../interfaces/ILogger';

export class ConsoleLogger implements ILogger {
  constructor(
    private readonly service: string,
    private readonly environment: string
  ) {}

  private log(
    level: string,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    const context = getLogContext() || {};
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      level,
      service: this.service,
      environment: this.environment,
      requestId: context.requestId,
      correlationId: context.correlationId,
      traceId: context.traceId,
      userId: context.userId,
      tenantId: context.tenantId,
      issueId: context.issueId,
      operation: context.operation,
      duration: context.duration,
      event: metadata?.event || undefined,
      message,
      metadata: metadata ? { ...metadata } : undefined,
      error: error
        ? {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
          }
        : undefined,
    };

    if (metadata?.event) {
      delete logEntry.metadata?.event;
    }

    if (this.environment === 'local' || this.environment === 'development') {
      const color = this.getColor(level);
      const reset = '\x1b[0m';
      const correlationStr = context.correlationId ? ` [cid:${context.correlationId}]` : '';
      const eventStr = logEntry.event ? ` [event:${logEntry.event}]` : '';

      const cleanMeta = metadata ? { ...metadata } : {};
      if (cleanMeta.event) delete cleanMeta.event;

      console.error(
        `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}${correlationStr}${eventStr}`,
        Object.keys(cleanMeta).length > 0 ? cleanMeta : '',
        error ? error : ''
      );
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  private getColor(level: string): string {
    switch (level) {
      case 'fatal':
        return '\x1b[41m\x1b[37m';
      case 'error':
        return '\x1b[31m';
      case 'warn':
        return '\x1b[33m';
      case 'info':
        return '\x1b[32m';
      case 'debug':
        return '\x1b[36m';
      case 'trace':
        return '\x1b[35m';
      default:
        return '';
    }
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
