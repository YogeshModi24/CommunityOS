import { MunicipalityAccessRequest } from '@community-os/types';

import { IMunicipalityAccessRequestRepository } from '../interfaces/IMunicipalityAccessRequestRepository';
import { mapMongoMunicipalityAccessRequest } from './mappers';
import MunicipalityAccessRequestMongoose from './models/MunicipalityAccessRequest';

export class MongoMunicipalityAccessRequestRepository implements IMunicipalityAccessRequestRepository {
  async findById(id: string): Promise<MunicipalityAccessRequest | null> {
    const doc = await MunicipalityAccessRequestMongoose.findById(id).lean();
    return doc ? mapMongoMunicipalityAccessRequest(doc) : null;
  }

  async findByEmail(email: string): Promise<MunicipalityAccessRequest | null> {
    const doc = await MunicipalityAccessRequestMongoose.findOne({ email }).lean();
    return doc ? mapMongoMunicipalityAccessRequest(doc) : null;
  }

  async findPendingByEmail(email: string): Promise<MunicipalityAccessRequest | null> {
    const doc = await MunicipalityAccessRequestMongoose.findOne({
      email,
      status: 'pending',
    }).lean();
    return doc ? mapMongoMunicipalityAccessRequest(doc) : null;
  }

  async listAll(): Promise<MunicipalityAccessRequest[]> {
    const docs = await MunicipalityAccessRequestMongoose.find().sort({ createdAt: -1 }).lean();
    return docs.map(mapMongoMunicipalityAccessRequest);
  }

  async create(
    request: Omit<MunicipalityAccessRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MunicipalityAccessRequest> {
    const doc = await MunicipalityAccessRequestMongoose.create(request);
    return mapMongoMunicipalityAccessRequest(doc.toObject());
  }

  async updateStatus(
    id: string,
    status: MunicipalityAccessRequest['status']
  ): Promise<MunicipalityAccessRequest | null> {
    const doc = await MunicipalityAccessRequestMongoose.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    return doc ? mapMongoMunicipalityAccessRequest(doc) : null;
  }

  async deleteAll(): Promise<void> {
    await MunicipalityAccessRequestMongoose.deleteMany({});
  }
}
