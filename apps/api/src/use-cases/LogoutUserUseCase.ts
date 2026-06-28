import { Result } from '@community-os/utils';

import { IAuthService } from '../services/contracts/IAuthService';

export class LogoutUserUseCase {
  constructor(private authService: IAuthService) {}

  async execute(sessionId: string): Promise<Result<void, string>> {
    return this.authService.logout(sessionId);
  }

  async executeLogoutAll(userId: string): Promise<Result<void, string>> {
    return this.authService.logoutAll(userId);
  }
}
