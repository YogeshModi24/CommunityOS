import { Notification } from '@community-os/types';
import { Result } from '@community-os/utils';

import { INotificationService } from '../services/contracts/INotificationService';

export class MarkNotificationReadUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(id: string, userId: string): Promise<Result<Notification, string>> {
    return await this.notificationService.markAsRead(id, userId);
  }
}
