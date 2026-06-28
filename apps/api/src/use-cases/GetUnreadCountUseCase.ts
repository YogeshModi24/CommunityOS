import { Result } from '@community-os/utils';

import { INotificationService } from '../services/contracts/INotificationService';

export class GetUnreadCountUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(userId: string): Promise<Result<number, string>> {
    return await this.notificationService.getUnreadCount(userId);
  }
}
