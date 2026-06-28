import { Result } from '@community-os/utils';

import { IUserService } from '../services/contracts/IUserService';

export class GetDashboardDataUseCase {
  constructor(private userService: IUserService) {}

  async execute(userId: string): Promise<Result<any, string>> {
    return this.userService.getDashboardData(userId);
  }
}
