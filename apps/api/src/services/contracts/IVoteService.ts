import { ToggleVoteResponseDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

export interface IVoteService {
  toggleVote(issueId: string, userId: string): Promise<Result<ToggleVoteResponseDTO, string>>;
}
