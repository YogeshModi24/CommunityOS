import { IUserRepository } from '@community-os/repositories';
import { User } from '@community-os/types';
import { Result } from '@community-os/utils';

import { logger } from '../lib/logger';
import { IUserService } from './contracts/IUserService';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getMe(userId: string): Promise<Result<User, string>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail('User not found');
    }
    return Result.ok(user);
  }

  async getLeaderboard(limit = 10): Promise<Result<User[], string>> {
    const users = await this.userRepository.getLeaderboard(limit);
    return Result.ok(users);
  }

  async createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<User, string>> {
    const created = await this.userRepository.create(user);
    return Result.ok(created);
  }

  async incrementPointsAndIssues(
    userId: string,
    points: number,
    issuesCount: number
  ): Promise<Result<User, string>> {
    const updated = await this.userRepository.incrementPointsAndIssues(userId, points, issuesCount);
    if (!updated) {
      return Result.fail('User not found');
    }
    return Result.ok(updated);
  }

  async getDashboardData(userId: string): Promise<Result<any, string>> {
    const startTime = Date.now();
    const data = await this.userRepository.getDashboardProjection(userId);
    if (!data) {
      return Result.fail('User not found');
    }

    const duration = Date.now() - startTime;
    if (duration > 300) {
      logger.warn(`[UserService] Dashboard API performance target exceeded: ${duration}ms`, {
        event: 'sla_target_exceeded',
        api: 'Dashboard',
        duration,
      });
    }

    return Result.ok(data);
  }
}
