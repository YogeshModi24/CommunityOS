import { Result } from '@community-os/utils';

import { INotificationService } from '../services/contracts/INotificationService';

export class MarkAllNotificationsReadUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(userId: string): Promise<Result<void, string>> {
    return await this.notificationService.markAllAsRead(userId);
  }
}
