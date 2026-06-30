import { IUserRepository } from '@community-os/repositories';
import { User } from '@community-os/types';
import { Result } from '@community-os/utils';
import bcrypt from 'bcryptjs';

import { IUserService } from '../services/contracts/IUserService';

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  ward?: string;
}

export class RegisterUserUseCase {
  constructor(
    private userService: IUserService,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: RegisterUserDTO): Promise<Result<User, string>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return Result.fail('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userToCreate = {
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: 'citizen' as const, // Force citizen role for self-registration
      ward: dto.ward,
      points: 0,
      issues_reported: 0,
      achievements: [],
      savedLocations: [],
    };

    return this.userService.createUser(userToCreate);
  }
}
