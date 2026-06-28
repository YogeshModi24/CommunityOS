import { User } from '@community-os/types';
import { Result } from '@community-os/utils';

export interface IUserService {
  getMe(userId: string): Promise<Result<User, string>>;
  getLeaderboard(limit?: number): Promise<Result<User[], string>>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User, string>>;
  incrementPointsAndIssues(
    userId: string,
    points: number,
    issuesCount: number
  ): Promise<Result<User, string>>;
  getDashboardData(userId: string): Promise<Result<any, string>>;
}
