import { getLogContext } from '@community-os/logger';
import { Queue } from 'bullmq';

import { logger } from '../lib/logger';
import { REDIS_URL } from '../lib/redis';

export interface AIJobData {
  issueId: string;
  imageUrl: string;
  reporterId: string;
  coordinates: [number, number];
  correlationContext?: {
    correlationId?: string;
    requestId?: string;
    userId?: string;
    tenantId?: string;
  };
}

class MockQueue {
  async add(name: string, data: AIJobData) {
    const context = getLogContext();
    data.correlationContext = {
      correlationId: context?.correlationId,
      requestId: context?.requestId,
      userId: context?.userId,
      tenantId: context?.tenantId,
    };

    logger.info(`[MockQueue] Queued job '${name}' for issue ${data.issueId} in-memory`, {
      event: 'job_queued',
      jobName: name,
      issueId: data.issueId,
    });

    // Run worker logic in the background after 3 seconds
    setTimeout(async () => {
      try {
        const { processJob } = await import('./aiWorker');
        await processJob(data);
      } catch (err: unknown) {
        logger.error('[MockQueue] Background execution failed', err, {
          event: 'job_background_failed',
        });
      }
    }, 3000);
    return { id: 'mock-job-' + Math.random().toString(36).substring(2, 9) };
  }
}

const useMock = !REDIS_URL || REDIS_URL === 'mock' || REDIS_URL.includes('change_me');

export const aiQueue = useMock
  ? (new MockQueue() as unknown as Queue<AIJobData>)
  : new Queue<AIJobData>('ai-analysis', {
      connection: { url: REDIS_URL },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
