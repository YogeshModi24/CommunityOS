import { Result } from '@community-os/utils';

import { StorageUploadResult } from './IStorageProvider';

export interface IUploadService {
  uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<Result<StorageUploadResult, string>>;
  deleteImage(publicId: string): Promise<Result<void, string>>;
}
