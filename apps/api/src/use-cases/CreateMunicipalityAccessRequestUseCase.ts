import { IMunicipalityAccessRequestRepository } from '@community-os/repositories';
import { MunicipalityAccessRequest } from '@community-os/types';
import { Result } from '@community-os/utils';

export interface CreateMunicipalityAccessRequestDTO {
  name: string;
  email: string;
  ward: string;
  message?: string;
}

export class CreateMunicipalityAccessRequestUseCase {
  constructor(private requestRepository: IMunicipalityAccessRequestRepository) {}

  async execute(
    dto: CreateMunicipalityAccessRequestDTO
  ): Promise<Result<MunicipalityAccessRequest, string>> {
    const existingRequest = await this.requestRepository.findPendingByEmail(dto.email);
    if (existingRequest) {
      return Result.fail('A pending access request already exists for this email address.');
    }

    const requestToCreate = {
      name: dto.name,
      email: dto.email.toLowerCase(),
      ward: dto.ward,
      message: dto.message,
      status: 'pending' as const,
    };

    const created = await this.requestRepository.create(requestToCreate);
    return Result.ok(created);
  }
}
