import { IMunicipalityAccessRequestRepository } from '@community-os/repositories';
import { MunicipalityAccessRequest } from '@community-os/types';
import { Result } from '@community-os/utils';

export class ListMunicipalityAccessRequestsUseCase {
  constructor(private requestRepository: IMunicipalityAccessRequestRepository) {}

  async execute(): Promise<Result<MunicipalityAccessRequest[], string>> {
    const list = await this.requestRepository.listAll();
    return Result.ok(list);
  }
}
