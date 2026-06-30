import { IUserRepository } from '@community-os/repositories';
import { User } from '@community-os/types';
import { Result } from '@community-os/utils';
import bcrypt from 'bcryptjs';

export interface CompleteSetupAccountDTO {
  token: string;
  password?: string;
}

export class CompleteSetupAccountUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: CompleteSetupAccountDTO): Promise<Result<User, string>> {
    const { token, password } = dto;
    if (!token) {
      return Result.fail('Setup token is required');
    }
    if (!password) {
      return Result.fail('Password is required');
    }

    const user = await this.userRepository.findByResetPasswordToken(token);
    if (!user) {
      return Result.fail('Invalid or already used setup token');
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      return Result.fail('Setup token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset fields
    const updatedUser = await this.userRepository.updatePasswordAndClearToken(
      user.id,
      hashedPassword
    );
    if (!updatedUser) {
      return Result.fail('Failed to update user account');
    }

    return Result.ok(updatedUser);
  }
}
