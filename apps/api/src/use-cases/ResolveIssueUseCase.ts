import { Issue, IssueResolved, UpdateIssueStatusDTO } from '@community-os/types';
import { Result } from '@community-os/utils';
import crypto from 'crypto';

import { IEventBus } from '../services/contracts/IEventBus';
import { IIssueService } from '../services/contracts/IIssueService';

export class ResolveIssueUseCase {
  constructor(
    private issueService: IIssueService,
    private eventBus: IEventBus
  ) {}

  async execute(issueId: string, dto: UpdateIssueStatusDTO): Promise<Result<Issue, string>> {
    const result = await this.issueService.updateStatus(issueId, dto);
    if (result.isFailure) {
      return result;
    }

    const updatedIssue = result.value;

    if (dto.status === 'resolved') {
      const resolvedEvent: IssueResolved = {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        aggregateId: issueId,
        name: 'IssueResolved',
        payload: {
          issueId,
          resolverId: undefined, // authority/admin userId can be mapped if available
          resolutionNote: dto.note,
        },
      };
      this.eventBus.publish(resolvedEvent);
    }

    return Result.ok(updatedIssue);
  }
}
