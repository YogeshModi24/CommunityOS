import { loadEnvFiles, validateServerEnv } from '@community-os/config';
import { LoggerFactory } from '@community-os/logger';
/* eslint-disable no-console */
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import path from 'path';

export const APP_NAME = 'worker';
export const VERSION = '0.1.0';

// Global references for graceful shutdown
let activeWorker: Worker<any> | null = null;
let redisClient: Redis | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let monitorQueue: Queue<any> | null = null;

async function bootstrap() {
  const startTime = Date.now();

  // 1. Load Configurations
  loadEnvFiles(path.resolve(__dirname, '..'));
  const env = validateServerEnv();

  // 2. Initialize Logger
  const isDev = env.NODE_ENV === 'local' || env.NODE_ENV === 'development';
  const provider = isDev ? 'console' : 'winston';
  const logger = LoggerFactory.createLogger(provider, APP_NAME, env.NODE_ENV);

  logger.info(`[Worker] Starting CommunityOS Background Worker v${VERSION} in ${env.NODE_ENV}...`, {
    event: 'worker_starting',
  });

  // 3. Connect MongoDB
  logger.info('[Worker] Connecting to MongoDB...', { event: 'mongodb_connecting' });
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info('[Worker] MongoDB connected successfully', { event: 'mongodb_connected' });

  // 4. Verify MongoDB Indexes
  try {
    // Import repositories to register all schema definitions
    await import('@community-os/repositories');
    const IssueModel = mongoose.model('Issue');
    await IssueModel.ensureIndexes();
    logger.info('[Worker] Mongoose indexes verified successfully', {
      event: 'db_indexes_verified',
    });
  } catch (idxErr: any) {
    logger.error('[Worker] Index verification warning', idxErr, {
      event: 'db_index_verification_failed',
    });
  }

  // 5. Connect Redis
  const useMock = !env.REDIS_URL || env.REDIS_URL === 'mock' || env.REDIS_URL.includes('change_me');

  if (!useMock) {
    logger.info('[Worker] Connecting to Redis...', { event: 'redis_connecting' });
    redisClient = new Redis(env.REDIS_URL);
    await new Promise<void>((resolve, reject) => {
      redisClient!.on('connect', () => resolve());
      redisClient!.on('error', (err) => reject(err));
    });
    logger.info('[Worker] Redis connected successfully', { event: 'redis_connected' });
  } else {
    logger.info('[Worker] Redis is configured as MOCK (In-Memory)', { event: 'redis_mock_active' });
  }

  // 6. Initialize DI Container
  logger.info('[Worker] Initializing DI Container...', { event: 'container_initializing' });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../api/src/infra/container');
  logger.info('[Worker] DI Container initialized successfully', { event: 'container_initialized' });

  // 7. Initialize BullMQ Workers
  if (!useMock) {
    logger.info('[Worker] Starting BullMQ Worker...', { event: 'ai_worker_starting' });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { startAIWorker } = require('../../api/src/jobs/aiWorker');
    activeWorker = startAIWorker();

    monitorQueue = new Queue('ai-analysis', { connection: { url: env.REDIS_URL } });
  } else {
    logger.info('[Worker] Running in Mock mode (In-Memory timeouts active)', {
      event: 'ai_worker_mock_active',
    });
  }

  // 8. Initialize Session Cleanup Scheduler
  logger.info('[Worker] Starting periodic session cleanup job...', {
    event: 'session_cleanup_init',
  });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { container: apiContainer } = require('../../api/src/infra/container');
  const sessionRepo = apiContainer.resolve('userSessionRepository') as any;

  const runCleanup = async () => {
    try {
      logger.info('[Worker] Running expired session cleanup...', {
        event: 'session_cleanup_started',
      });
      await sessionRepo.cleanupExpiredSessions();
      logger.info('[Worker] Expired sessions cleaned up successfully', {
        event: 'session_cleanup_success',
      });
    } catch (err: any) {
      logger.error('[Worker] Failed to cleanup expired sessions', err, {
        event: 'session_cleanup_failed',
      });
    }
  };

  // Run cleanup immediately
  await runCleanup();

  // Run cleanup every 1 hour
  const ONE_HOUR = 60 * 60 * 1000;
  cleanupInterval = setInterval(runCleanup, ONE_HOUR);

  // 9. Start Heartbeat Monitor (log queue depths every 1 minute)
  const ONE_MINUTE = 60 * 1000;
  heartbeatInterval = setInterval(async () => {
    if (monitorQueue) {
      try {
        const [active, waiting, failed, completed] = await Promise.all([
          monitorQueue.getActiveCount(),
          monitorQueue.getWaitingCount(),
          monitorQueue.getFailedCount(),
          monitorQueue.getCompletedCount(),
        ]);
        logger.info(
          `[Worker Heartbeat] Queue Stats: active=${active}, waiting=${waiting}, failed=${failed}, completed=${completed}`,
          {
            event: 'worker_heartbeat',
            active,
            waiting,
            failed,
            completed,
          }
        );
      } catch (err: any) {
        logger.error('[Worker Heartbeat] Failed to fetch queue stats', err);
      }
    } else {
      logger.info('[Worker Heartbeat] Running in Mock mode. Heartbeat OK.', {
        event: 'worker_heartbeat',
      });
    }
  }, ONE_MINUTE);

  const startupTime = Date.now() - startTime;
  logger.info(`[Worker] Startup completed in ${startupTime}ms. Background processing active.`, {
    event: 'worker_ready',
    startupTime,
  });
}

// Graceful Shutdown Handler
async function shutdown(signal: string) {
  console.log(`[Worker] Received ${signal}. Starting graceful shutdown...`);

  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (cleanupInterval) clearInterval(cleanupInterval);

  try {
    // 1. Stop BullMQ worker
    if (activeWorker) {
      console.log('[Worker] Stopping BullMQ worker...');
      await activeWorker.close();
      console.log('[Worker] BullMQ worker stopped.');
    }

    // 2. Close monitoring queue
    if (monitorQueue) {
      await monitorQueue.close();
    }

    // 3. Disconnect Redis
    if (redisClient) {
      console.log('[Worker] Disconnecting Redis...');
      await redisClient.quit();
      console.log('[Worker] Redis disconnected.');
    }

    // 4. Disconnect MongoDB
    console.log('[Worker] Disconnecting MongoDB...');
    await mongoose.disconnect();
    console.log('[Worker] MongoDB disconnected.');

    console.log('[Worker] Graceful shutdown completed.');
    process.exit(0);
  } catch (err) {
    console.error('[Worker] Error during graceful shutdown:', err);
    process.exit(1);
  }
}

// Register Signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap().catch((err) => {
  console.error('[Worker Fatal Error] Bootstrapping failed:', err);
  process.exit(1);
});
