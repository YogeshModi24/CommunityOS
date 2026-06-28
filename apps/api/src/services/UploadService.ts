import { Result } from '@community-os/utils';

import { logger } from '../lib/logger';
import { IStorageProvider, StorageUploadResult } from './contracts/IStorageProvider';
import { IUploadService } from './contracts/IUploadService';

export class UploadService implements IUploadService {
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  constructor(private storageProvider: IStorageProvider) {}

  async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<Result<StorageUploadResult, string>> {
    // 1. Validate max size
    if (fileBuffer.length > this.MAX_SIZE) {
      logger.warn('[UploadService] File size too large', {
        size: fileBuffer.length,
        maxSize: this.MAX_SIZE,
      });
      return Result.fail(
        `File size exceeds 10MB limit (uploaded: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB)`
      );
    }

    // 2. Validate MIME type
    if (!this.ALLOWED_MIMES.includes(mimeType.toLowerCase())) {
      logger.warn('[UploadService] Unsupported MIME type', { mimeType });
      return Result.fail(`Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, HEIC`);
    }

    try {
      const result = await this.storageProvider.upload(fileBuffer, originalName, mimeType);
      return Result.ok(result);
    } catch (err: any) {
      logger.error('[UploadService] Storage provider upload failed', err);
      return Result.fail(`Upload failed: ${err.message || err}`);
    }
  }

  async deleteImage(publicId: string): Promise<Result<void, string>> {
    try {
      await this.storageProvider.delete(publicId);
      return Result.ok();
    } catch (err: any) {
      logger.error('[UploadService] Storage provider delete failed', err);
      return Result.fail(`Delete failed: ${err.message || err}`);
    }
  }
}
