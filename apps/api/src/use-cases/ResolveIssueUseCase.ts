import { DomainEvent, IssueResolvedV1Payload } from '@community-os/events';
import { Issue, UpdateIssueStatusDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

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
      const resolvedEvent: DomainEvent<IssueResolvedV1Payload> = {
        type: 'IssueResolved',
        occurredAt: new Date(),
        payload: {
          issueId,
          resolutionNote: dto.note || '',
          resolvedAt: new Date(),
        },
      };
      this.eventBus.publish(resolvedEvent);
    }

    return Result.ok(updatedIssue);
  }
}
