import { DomainEvent, IssueUpdatedV1Payload } from '@community-os/events';
import { Issue } from '@community-os/types';
import { Result } from '@community-os/utils';

import { IEventBus } from '../services/contracts/IEventBus';
import { IIssueService } from '../services/contracts/IIssueService';

export interface AssignIssueDTO {
  department: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: string;
  dueDate?: Date;
}

export class AssignIssueUseCase {
  constructor(
    private issueService: IIssueService,
    private eventBus: IEventBus
  ) {}

  async execute(
    issueId: string,
    dto: AssignIssueDTO,
    assignedById: string
  ): Promise<Result<Issue, string>> {
    const assignment = {
      department: dto.department,
      assignedToId: dto.assignedToId,
      assignedToName: dto.assignedToName,
      assignedToRole: dto.assignedToRole,
      assignedAt: new Date(),
      assignedById,
      dueDate: dto.dueDate,
      status: 'assigned' as const,
    };

    const result = await this.issueService.assignIssue(issueId, assignment);
    if (result.isFailure) {
      return result;
    }

    const updatedIssue = result.value;

    const event: DomainEvent<IssueUpdatedV1Payload> = {
      type: 'IssueUpdated',
      occurredAt: new Date(),
      payload: {
        issueId,
        department: dto.department,
        updatedAt: new Date(),
      },
    };
    this.eventBus.publish(event);

    return Result.ok(updatedIssue);
  }
}
