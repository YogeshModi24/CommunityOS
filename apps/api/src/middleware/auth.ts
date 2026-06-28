import { UnauthorizedError } from '@community-os/errors';
import { enrichLogContext } from '@community-os/logger';
import { JWTPayload } from '@community-os/types';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../env';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  tenantId?: string;
  sessionId?: string;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.userId = payload.sub;
    req.userRole = payload.role;
    req.tenantId = payload.tenantId;
    req.sessionId = payload.sessionId;

    enrichLogContext({
      userId: payload.sub,
      tenantId: payload.tenantId,
    });
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      next(new UnauthorizedError('Insufficient permissions'));
      return;
    }
    next();
  };
}
