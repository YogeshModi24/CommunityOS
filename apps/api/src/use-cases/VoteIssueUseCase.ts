import { DomainEvent, IssuePriorityUpdatedV1Payload,VoteAddedV1Payload, VoteRemovedV1Payload } from '@community-os/events';
import { ToggleVoteResponseDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

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
      const voteEvent: DomainEvent<VoteAddedV1Payload> = {
        type: 'VoteAdded',
        occurredAt: new Date(),
        payload: {
          issueId,
          voterId: userId,
          newVoteCount: payload.votes,
          newPriorityScore: payload.priority_score,
        },
      };
      this.eventBus.publish(voteEvent);
    } else {
      const voteEvent: DomainEvent<VoteRemovedV1Payload> = {
        type: 'VoteRemoved',
        occurredAt: new Date(),
        payload: {
          issueId,
          voterId: userId,
          newVoteCount: payload.votes,
          newPriorityScore: payload.priority_score,
        },
      };
      this.eventBus.publish(voteEvent);
    }

    const priorityEvent: DomainEvent<IssuePriorityUpdatedV1Payload> = {
      type: 'IssuePriorityUpdated',
      occurredAt: new Date(),
      payload: {
        issueId,
        priorityScore: payload.priority_score,
      },
    };
    this.eventBus.publish(priorityEvent);

    return Result.ok(payload);
  }
}
