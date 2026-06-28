import { ValidationError } from '@community-os/errors';
import { NextFunction, Response } from 'express';

import { container } from '../infra/container';
import { AuthRequest } from '../middleware/auth';
import { VoteIssueUseCase } from '../use-cases/VoteIssueUseCase';

// POST /api/issues/:id/vote
export async function toggleVote(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const issueId = req.params.id;
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const voteUseCase = container.resolve<VoteIssueUseCase>(VoteIssueUseCase);
    const result = await voteUseCase.execute(issueId, req.userId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}
