import { IssueAnalyzed, IssuePriorityUpdated } from '@community-os/types';
import { Result } from '@community-os/utils';
import crypto from 'crypto';

import { PriorityPolicy } from '../domain/policies/PriorityPolicy';
import { RewardPolicy } from '../domain/policies/RewardPolicy';
import { logger } from '../lib/logger';
import { IAIService } from '../services/contracts/IAIService';
import { IEventBus } from '../services/contracts/IEventBus';
import { IIssueService } from '../services/contracts/IIssueService';
import { IUserService } from '../services/contracts/IUserService';

export class AnalyzeIssueUseCase {
  constructor(
    private issueService: IIssueService,
    private aiService: IAIService,
    private userService: IUserService,
    private eventBus: IEventBus
  ) {}

  async execute(data: {
    issueId: string;
    imageUrl: string;
    reporterId: string;
  }): Promise<Result<void, string>> {
    const { issueId, imageUrl, reporterId } = data;

    const startTime = Date.now();

    // 1. Fetch issue
    const issueResult = await this.issueService.getIssue(issueId);
    if (issueResult.isFailure) {
      return Result.fail(`Issue fetching failed: ${issueResult.error}`);
    }
    const issue = issueResult.value;

    // 2. Check Idempotency (completed or processing state skips analysis, failed is retryable)
    if (issue.ai_status === 'completed' || issue.ai_status === 'processing') {
      logger.info(
        `[AnalyzeIssueUseCase] Idempotency skip: Issue ${issueId} is in status '${issue.ai_status}'`,
        {
          event: 'ai_worker_idempotency_skip',
          issueId,
          status: issue.ai_status,
        }
      );
      return Result.ok();
    }

    // 3. Mark as processing
    await this.issueService.updateAIStatus(issueId, 'processing');

    try {
      // 4. Run AI analysis
      const aiResult = await this.aiService.analyzeIssueImage(imageUrl);
      if (aiResult.isFailure) {
        await this.issueService.updateAIStatus(issueId, 'failed');
        return Result.fail(`AI analysis failed: ${aiResult.error}`);
      }
      const analysis = aiResult.value;

      // 5. Calculate priority score
      const priorityScore = PriorityPolicy.calculateScore({
        severity: analysis.severity,
        votes: 0,
        hazardous: analysis.hazardous,
        createdAt: issue.createdAt,
      });

      // 6. Save AI results and mark completed
      const updateResult = await this.issueService.updateIssueAIResults(
        issueId,
        {
          ...analysis,
          processedAt: new Date(),
        },
        priorityScore
      );

      if (updateResult.isFailure) {
        await this.issueService.updateAIStatus(issueId, 'failed');
        return Result.fail(`Issue update failed: ${updateResult.error}`);
      }

      // 7. Award rewards (only on first successful transition to completed)
      const rewardPoints = RewardPolicy.calculatePoints('report_issue');
      await this.userService.incrementPointsAndIssues(reporterId, rewardPoints, 1);

      // 8. Publish Domain Events
      const analyzedEvent: IssueAnalyzed = {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        aggregateId: issueId,
        name: 'IssueAnalyzed',
        payload: {
          issueId,
          category: analysis.category,
          severity: analysis.severity,
          hazardous: analysis.hazardous,
          confidence: analysis.confidence,
          department: analysis.department,
          estimated_sla_days: analysis.estimated_sla_days,
          aiVersion: analysis.aiVersion,
          modelName: analysis.modelName,
          promptVersion: analysis.promptVersion,
          processedAt: new Date(),
        },
      };
      this.eventBus.publish(analyzedEvent);

      const priorityEvent: IssuePriorityUpdated = {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        aggregateId: issueId,
        name: 'IssuePriorityUpdated',
        payload: {
          issueId,
          priorityScore,
        },
      };
      this.eventBus.publish(priorityEvent);

      const duration = Date.now() - startTime;
      if (duration > 60000) {
        logger.warn(
          `[AnalyzeIssueUseCase] AI analysis processing SLA target exceeded: ${duration}ms`,
          {
            event: 'sla_target_exceeded',
            api: 'AI Worker',
            duration,
          }
        );
      }

      return Result.ok();
    } catch (err: any) {
      logger.error(
        `[AnalyzeIssueUseCase] Execution error for issue ${issueId}: ${err.message || err}`,
        err
      );
      await this.issueService.updateAIStatus(issueId, 'failed');
      return Result.fail(`Analysis execution error: ${err.message || err}`);
    }
  }
}
