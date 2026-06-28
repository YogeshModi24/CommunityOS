import { AuthSessionDTO, ClientMetaDTO, LoginRequestDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

import { IAuthService } from '../services/contracts/IAuthService';

export class LoginUserUseCase {
  constructor(private authService: IAuthService) {}

  async execute(
    dto: LoginRequestDTO,
    clientMeta: ClientMetaDTO
  ): Promise<Result<AuthSessionDTO, string>> {
    return this.authService.login(dto, clientMeta);
  }
}
