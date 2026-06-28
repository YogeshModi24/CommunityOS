import { NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  logger.info(`HTTP ${req.method} ${req.url} started`, {
    event: 'http_request_started',
    method: req.method,
    url: req.url,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      `HTTP ${req.method} ${req.url} completed with status ${res.statusCode} in ${duration}ms`,
      {
        event: 'http_request_completed',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      }
    );
  });

  next();
}
