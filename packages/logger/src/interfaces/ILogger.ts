export interface ILogger {
  trace(message: string, metadata?: Record<string, any>): void;
  debug(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
  fatal(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
}
