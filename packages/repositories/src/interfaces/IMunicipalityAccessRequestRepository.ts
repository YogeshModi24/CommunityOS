import { MunicipalityAccessRequest } from '@community-os/types';

export interface IMunicipalityAccessRequestRepository {
  findById(id: string): Promise<MunicipalityAccessRequest | null>;
  findByEmail(email: string): Promise<MunicipalityAccessRequest | null>;
  findPendingByEmail(email: string): Promise<MunicipalityAccessRequest | null>;
  listAll(): Promise<MunicipalityAccessRequest[]>;
  create(
    request: Omit<MunicipalityAccessRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MunicipalityAccessRequest>;
  updateStatus(
    id: string,
    status: MunicipalityAccessRequest['status']
  ): Promise<MunicipalityAccessRequest | null>;
  deleteAll(): Promise<void>;
}
