import { ForbiddenError } from '@community-os/errors';
import { AuthEventType } from '@community-os/types';
import { NextFunction, Response } from 'express';

import { logger } from '../lib/logger';
import { AuthRequest } from './auth';

export function rbacMiddleware(allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      logger.warn(
        `[RBAC] Access denied for user ${req.userId || 'anonymous'} with role ${req.userRole || 'none'}`,
        {
          event: AuthEventType.RBACDenied,
          userId: req.userId,
          role: req.userRole,
          allowedRoles,
        }
      );
      next(new ForbiddenError('Forbidden access: Insufficient permissions'));
      return;
    }
    next();
  };
}
