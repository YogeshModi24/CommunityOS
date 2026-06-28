import { AuthSessionDTO, ClientMetaDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

import { IAuthService } from '../services/contracts/IAuthService';

export class RefreshTokenUseCase {
  constructor(private authService: IAuthService) {}

  async execute(
    rawRefreshToken: string,
    clientMeta: ClientMetaDTO
  ): Promise<Result<AuthSessionDTO, string>> {
    return this.authService.refreshSession(rawRefreshToken, clientMeta);
  }
}
