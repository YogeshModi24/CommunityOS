import { runWithContext } from '@community-os/logger';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  const requestId = crypto.randomUUID();

  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-request-id', requestId);

  const context = {
    correlationId,
    requestId,
    tenantId: (req.headers['x-tenant-id'] as string) || 'default',
  };

  runWithContext(context, () => {
    next();
  });
}
