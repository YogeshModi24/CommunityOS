import { getLogContext } from '@community-os/logger';
import { CreateIssueDTO, Issue, IssueCreated } from '@community-os/types';
import { Result } from '@community-os/utils';
import crypto from 'crypto';

import { aiQueue } from '../jobs/queue';
import { logger } from '../lib/logger';
import { IEventBus } from '../services/contracts/IEventBus';
import { IIssueService } from '../services/contracts/IIssueService';
import { IUploadService } from '../services/contracts/IUploadService';

export class ReportIssueUseCase {
  constructor(
    private issueService: IIssueService,
    private uploadService: IUploadService,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateIssueDTO, userId: string): Promise<Result<Issue, string>> {
    // 1. Create the issue in DB
    const result = await this.issueService.createIssue(dto, userId);

    if (result.isFailure) {
      // Directives 1: Delete uploaded image asset immediately if database write fails
      if (dto.mediaPublicId) {
        logger.info(
          `[ReportIssueUseCase] DB persistence failed. Deleting uploaded asset ${dto.mediaPublicId} from Cloudinary...`
        );
        await this.uploadService.deleteImage(dto.mediaPublicId);
      }
      return result;
    }

    const issue = result.value;

    // 2. Publish Domain Event
    const event: IssueCreated = {
      eventId: crypto.randomUUID(),
      occurredAt: new Date(),
      aggregateId: issue.id,
      name: 'IssueCreated',
      payload: {
        issueId: issue.id,
        reporterId: userId,
        category: issue.category,
      },
    };
    this.eventBus.publish(event);

    // 3. Queue the background AI analysis job
    const context = getLogContext();
    const jobPayload = {
      issueId: issue.id,
      imageUrl: dto.mediaUrl,
      reporterId: userId,
      coordinates: [Number(dto.lng), Number(dto.lat)] as [number, number],
      correlationContext: {
        correlationId: context?.correlationId,
        requestId: context?.requestId,
        userId: context?.userId,
        tenantId: context?.tenantId,
      },
    };

    try {
      await aiQueue.add('analyze', jobPayload);
    } catch (err: any) {
      // Directives 1: If DB succeeds but queue fails, mark the issue as pending, do not delete it, and retry queue publishing asynchronously
      logger.error(
        `[ReportIssueUseCase] Queue publishing failed. Retrying asynchronously. Error: ${err.message || err}`,
        err
      );

      this.retryQueuePublishing(jobPayload);
    }

    return Result.ok(issue);
  }

  private retryQueuePublishing(jobPayload: any, retriesLeft = 3, delay = 2000): void {
    setTimeout(async () => {
      try {
        await aiQueue.add('analyze', jobPayload);
        logger.info(
          `[ReportIssueUseCase] Async queue publishing retry succeeded for issue ${jobPayload.issueId}`
        );
      } catch (retryErr: any) {
        if (retriesLeft > 0) {
          logger.warn(
            `[ReportIssueUseCase] Async queue publishing retry failed. Retries left: ${retriesLeft}. Retrying in ${delay * 2}ms...`
          );
          this.retryQueuePublishing(jobPayload, retriesLeft - 1, delay * 2);
        } else {
          logger.error(
            `[ReportIssueUseCase] Async queue publishing permanently failed for issue ${jobPayload.issueId}`,
            retryErr
          );
        }
      }
    }, delay);
  }
}
