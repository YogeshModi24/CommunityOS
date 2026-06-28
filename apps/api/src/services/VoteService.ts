import { IIssueRepository } from '@community-os/repositories';
import { ToggleVoteResponseDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

import { PriorityPolicy } from '../domain/policies/PriorityPolicy';
import { IVoteService } from './contracts/IVoteService';

export class VoteService implements IVoteService {
  constructor(private issueRepository: IIssueRepository) {}

  async toggleVote(
    issueId: string,
    userId: string
  ): Promise<Result<ToggleVoteResponseDTO, string>> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) {
      return Result.fail('Issue not found');
    }

    const voterIds = (issue.voter_ids || []) as string[];
    const hasVoted = voterIds.includes(userId);

    let updatedVoterIds: string[];
    let votesCount = issue.votes;

    if (hasVoted) {
      updatedVoterIds = voterIds.filter((id) => id !== userId);
      votesCount = Math.max(0, votesCount - 1);
    } else {
      updatedVoterIds = [...voterIds, userId];
      votesCount += 1;
    }

    const priorityScore = PriorityPolicy.calculateScore({
      severity: issue.severity,
      votes: votesCount,
      hazardous: issue.hazardous,
      createdAt: issue.createdAt,
    });

    await this.issueRepository.update(issueId, {
      voter_ids: updatedVoterIds,
      votes: votesCount,
      priority_score: priorityScore,
    });

    return Result.ok({
      issueId,
      votes: votesCount,
      priority_score: priorityScore,
      hasVoted: !hasVoted,
    });
  }
}
