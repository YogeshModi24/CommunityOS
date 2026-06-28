import {
  IssuePriorityUpdated,
  ToggleVoteResponseDTO,
  VoteAdded,
  VoteRemoved,
} from '@community-os/types';
import { Result } from '@community-os/utils';
import crypto from 'crypto';

import { IEventBus } from '../services/contracts/IEventBus';
import { IVoteService } from '../services/contracts/IVoteService';

export class VoteIssueUseCase {
  constructor(
    private voteService: IVoteService,
    private eventBus: IEventBus
  ) {}

  async execute(issueId: string, userId: string): Promise<Result<ToggleVoteResponseDTO, string>> {
    const result = await this.voteService.toggleVote(issueId, userId);
    if (result.isFailure) {
      return result;
    }

    const payload = result.value;

    // Directives 3: Services return events; Use Cases publish them
    if (payload.hasVoted) {
      const voteEvent: VoteAdded = {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        aggregateId: issueId,
        name: 'VoteAdded',
        payload: {
          issueId,
          userId,
        },
      };
      this.eventBus.publish(voteEvent);
    } else {
      const voteEvent: VoteRemoved = {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        aggregateId: issueId,
        name: 'VoteRemoved',
        payload: {
          issueId,
          userId,
        },
      };
      this.eventBus.publish(voteEvent);
    }

    const priorityEvent: IssuePriorityUpdated = {
      eventId: crypto.randomUUID(),
      occurredAt: new Date(),
      aggregateId: issueId,
      name: 'IssuePriorityUpdated',
      payload: {
        issueId,
        priorityScore: payload.priority_score,
      },
    };
    this.eventBus.publish(priorityEvent);

    return Result.ok(payload);
  }
}
