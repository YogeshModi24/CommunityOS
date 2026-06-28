import { AuthSessionDTO, ClientMetaDTO, LoginRequestDTO } from '@community-os/types';
import { Result } from '@community-os/utils';

export interface IAuthService {
  login(data: LoginRequestDTO, clientMeta: ClientMetaDTO): Promise<Result<AuthSessionDTO, string>>;
  refreshSession(
    rawRefreshToken: string,
    clientMeta: ClientMetaDTO
  ): Promise<Result<AuthSessionDTO, string>>;
  logout(sessionId: string): Promise<Result<void, string>>;
  logoutAll(userId: string): Promise<Result<void, string>>;
}
