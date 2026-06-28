import { IUserSessionRepository } from '@community-os/repositories';

import { container } from '../infra/container';
import { logger } from '../lib/logger';

export function startSessionCleanupJob(): void {
  logger.info('[SessionCleanup] Initializing expired session cleanup job...', {
    event: 'session_cleanup_init',
  });

  const runCleanup = async () => {
    try {
      logger.info('[SessionCleanup] Running expired session cleanup...', {
        event: 'session_cleanup_started',
      });
      const sessionRepo = container.resolve<IUserSessionRepository>('userSessionRepository');
      await sessionRepo.cleanupExpiredSessions();
      logger.info('[SessionCleanup] Expired sessions cleaned up successfully', {
        event: 'session_cleanup_success',
      });
    } catch (err: unknown) {
      logger.error('[SessionCleanup] Failed to cleanup expired sessions', err, {
        event: 'session_cleanup_failed',
      });
    }
  };

  // Run immediately on startup
  runCleanup();

  // Run every 1 hour (3600000 milliseconds)
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(runCleanup, ONE_HOUR);
}
