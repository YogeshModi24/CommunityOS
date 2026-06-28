import { runWithContext } from '@community-os/logger';
import { Worker } from 'bullmq';
import crypto from 'crypto';
import type { Server } from 'socket.io';

import { container } from '../infra/container';
import { logger } from '../lib/logger';
import { REDIS_URL } from '../lib/redis';
import { AnalyzeIssueUseCase } from '../use-cases/AnalyzeIssueUseCase';
import type { AIJobData } from './queue';

export function setSocketIO(io: Server): void {
  // Socket.io instance wiring is now mapped directly onto the UseCase container
}

export async function processJob(data: AIJobData): Promise<void> {
  const { issueId, imageUrl, reporterId } = data;
  const correlationId = data.correlationContext?.correlationId || crypto.randomUUID();
  const requestId = data.correlationContext?.requestId || crypto.randomUUID();
  const userId = data.correlationContext?.userId || data.reporterId;
  const tenantId = data.correlationContext?.tenantId || 'default';

  await runWithContext(
    {
      correlationId,
      requestId,
      userId,
      tenantId,
      issueId,
      operation: 'ai_worker_process',
    },
    async () => {
      logger.info(`[AIWorker] Starting AI analysis use case for issue ${issueId}`, {
        event: 'ai_worker_started',
      });

      const analyzeUseCase = container.resolve<AnalyzeIssueUseCase>(AnalyzeIssueUseCase);
      const result = await analyzeUseCase.execute({ issueId, imageUrl, reporterId });

      if (result.isFailure) {
        throw new Error(result.error);
      }

      logger.info(`[AIWorker] Successfully processed AI analysis use case for issue ${issueId}`, {
        event: 'ai_worker_success',
      });
    }
  );
}

export function startAIWorker(): Worker<AIJobData> | null {
  if (!REDIS_URL || REDIS_URL === 'mock' || REDIS_URL.includes('change_me')) {
    logger.info('[AIWorker] Running in Mock (In-Memory) mode. BullMQ Worker not started.', {
      event: 'ai_worker_mock_active',
    });
    return null;
  }

  logger.info('[AIWorker] Starting BullMQ Worker...', { event: 'ai_worker_starting' });
  const worker = new Worker<AIJobData>(
    'ai-analysis',
    async (job) => {
      await processJob(job.data);
    },
    {
      connection: { url: REDIS_URL },
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[AIWorker] Job ${job?.id} failed: ${err.message}`, err, {
      event: 'ai_worker_job_failed',
      jobId: job?.id,
    });
  });

  worker.on('completed', (job) => {
    logger.info(`[AIWorker] Job ${job.id} completed`, {
      event: 'ai_worker_job_completed',
      jobId: job.id,
    });
  });

  return worker;
}
