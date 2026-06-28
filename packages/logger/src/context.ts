import { AsyncLocalStorage } from 'async_hooks';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  issueId?: string;
  [key: string]: any;
}

export const logContextStorage = new AsyncLocalStorage<LogContext>();

export function getLogContext(): LogContext | undefined {
  return logContextStorage.getStore();
}

export function runWithContext<T>(context: LogContext, fn: () => T): T {
  return logContextStorage.run(context, fn);
}

export function enrichLogContext(context: Partial<LogContext>): void {
  const current = logContextStorage.getStore();
  if (current) {
    Object.assign(current, context);
  }
}
