import { IUserRepository } from '@community-os/repositories';
import { Result } from '@community-os/utils';

export class ValidateSetupTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(token: string): Promise<Result<{ email: string; name: string }, string>> {
    if (!token) {
      return Result.fail('Setup token is required');
    }

    const user = await this.userRepository.findByResetPasswordToken(token);
    if (!user) {
      return Result.fail('Invalid or already used setup token');
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      return Result.fail('Setup token has expired');
    }

    return Result.ok({
      email: user.email,
      name: user.name,
    });
  }
}
