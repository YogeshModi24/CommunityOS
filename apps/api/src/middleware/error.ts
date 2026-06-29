import { ApplicationError, InternalServerError, ValidationError } from '@community-os/errors';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../lib/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let appError: ApplicationError;

  if (err instanceof ApplicationError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new ValidationError('Validation failed', err.errors);
  } else {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    appError = new InternalServerError(msg);
  }

  if (appError.status >= 500) {
    logger.error(`Critical Application Error: ${appError.message}`, err, {
      event: 'application_error',
      code: appError.code,
      status: appError.status,
      retryable: appError.retryable,
    });
  } else {
    logger.warn(`Application Warning: ${appError.message}`, {
      event: 'application_warning',
      code: appError.code,
      status: appError.status,
      retryable: appError.retryable,
      details: appError.details,
    });
  }

  res.status(appError.status).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
  });
}
