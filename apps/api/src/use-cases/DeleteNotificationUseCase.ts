import { Result } from '@community-os/utils';

import { INotificationService } from '../services/contracts/INotificationService';

export class DeleteNotificationUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(id: string, userId: string): Promise<Result<boolean, string>> {
    return await this.notificationService.deleteNotification(id, userId);
  }
}
