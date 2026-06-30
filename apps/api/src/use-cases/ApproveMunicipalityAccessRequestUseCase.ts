import { IMunicipalityAccessRequestRepository, IUserRepository } from '@community-os/repositories';
import { Result } from '@community-os/utils';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { IUserService } from '../services/contracts/IUserService';

export class ApproveMunicipalityAccessRequestUseCase {
  constructor(
    private requestRepository: IMunicipalityAccessRequestRepository,
    private userRepository: IUserRepository,
    private userService: IUserService
  ) {}

  async execute(requestId: string): Promise<Result<{ user: any; setupToken: string }, string>> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      return Result.fail('Access request not found.');
    }

    if (request.status !== 'pending') {
      return Result.fail(
        `Access request cannot be approved because its status is '${request.status}'.`
      );
    }

    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      return Result.fail('A user account with this email is already registered.');
    }

    // 1. Generate unusable password hash (user cannot login directly yet)
    const lockedRaw = 'LOCKED-MUNICIPALITY-' + crypto.randomBytes(32).toString('hex');
    const lockedPasswordHash = await bcrypt.hash(lockedRaw, 10);

    // 2. Generate time-limited, secure setup token (24h expiry)
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userToCreate = {
      name: request.name,
      email: request.email.toLowerCase(),
      password: lockedPasswordHash,
      role: 'municipality' as const,
      ward: request.ward,
      points: 0,
      issues_reported: 0,
      achievements: [],
      savedLocations: [],
      resetPasswordToken: setupToken,
      resetPasswordExpires: setupTokenExpires,
    };

    const createUserResult = await this.userService.createUser(userToCreate);
    if (createUserResult.isFailure) {
      return Result.fail(createUserResult.error);
    }

    // 3. Mark access request as approved
    await this.requestRepository.updateStatus(requestId, 'approved');

    // TODO: In production, email this token/link directly to the approved municipality official instead of returning in the response body.
    return Result.ok({
      user: createUserResult.value,
      setupToken,
    });
  }
}
