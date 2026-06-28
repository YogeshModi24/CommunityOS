import { Notification } from '@community-os/types';
import { Result } from '@community-os/utils';

import { INotificationService } from '../services/contracts/INotificationService';

export class GetRecentNotificationsUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<Result<{ notifications: Notification[]; total: number }, string>> {
    return await this.notificationService.getRecentNotifications(userId, page, limit);
  }
}
