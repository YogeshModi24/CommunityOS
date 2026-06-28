import { v2 as cloudinary } from 'cloudinary';

import { env } from '../../env';
import { logger } from '../../lib/logger';
import { IStorageProvider, StorageUploadResult } from '../contracts/IStorageProvider';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryStorageProvider implements IStorageProvider {
  private isTransientError(error: any): boolean {
    if (error.http_code) {
      const code = Number(error.http_code);
      return code === 429 || code >= 500;
    }
    const message = (error.message || '').toLowerCase();
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('eai_again') ||
      message.includes('connect')
    ) {
      return true;
    }
    return false;
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && this.isTransientError(error)) {
        logger.warn(
          `[CloudinaryStorageProvider] Transient error detected. Retrying upload in ${delay}ms...`,
          { error: error.message || error }
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<StorageUploadResult> {
    // If credentials are mock, return a local simulated fallback immediately
    if (
      !env.CLOUDINARY_CLOUD_NAME ||
      env.CLOUDINARY_CLOUD_NAME === 'mock' ||
      env.CLOUDINARY_CLOUD_NAME.startsWith('change_me')
    ) {
      logger.info('[CloudinaryStorageProvider] Running in mock storage mode.');
      const mockKey = originalName.toLowerCase();
      let fallbackUrl =
        'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80';
      if (mockKey.includes('garbage') || mockKey.includes('trash') || mockKey.includes('waste')) {
        fallbackUrl =
          'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80';
      } else if (
        mockKey.includes('water') ||
        mockKey.includes('leak') ||
        mockKey.includes('pipe')
      ) {
        fallbackUrl =
          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80';
      }
      return {
        originalUrl: fallbackUrl,
        optimizedUrl: fallbackUrl,
        thumbnailUrl: fallbackUrl,
        publicId: `mock-public-id-${Date.now()}`,
      };
    }

    const performUpload = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'community-hero',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error ?? new Error('Cloudinary upload returned empty result'));
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    const startTime = Date.now();
    const result = await this.retryWithBackoff(performUpload);
    const duration = Date.now() - startTime;

    if (duration > 3000) {
      logger.warn(
        `[CloudinaryStorageProvider] Image upload exceeded SLA target of 3s: ${duration}ms`,
        { duration }
      );
    }

    const originalUrl = result.secure_url;
    const optimizedUrl = cloudinary.url(result.public_id, {
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    });
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    });

    return {
      originalUrl,
      optimizedUrl,
      thumbnailUrl,
      publicId: result.public_id,
    };
  }

  async delete(publicId: string): Promise<void> {
    if (
      !env.CLOUDINARY_CLOUD_NAME ||
      env.CLOUDINARY_CLOUD_NAME === 'mock' ||
      env.CLOUDINARY_CLOUD_NAME.startsWith('change_me')
    ) {
      return;
    }
    const performDelete = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) return reject(error);
          resolve();
        });
      });
    };
    await this.retryWithBackoff(performDelete);
  }
}
