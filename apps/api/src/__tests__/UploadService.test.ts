import { v2 as cloudinary } from 'cloudinary';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudinaryStorageProvider } from '../services/providers/CloudinaryStorageProvider';
import { UploadService } from '../services/UploadService';

vi.mock('cloudinary', () => {
  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload_stream: vi.fn(),
        destroy: vi.fn(),
      },
      url: vi.fn((publicId, _opts) => `https://res.cloudinary.com/mock/${publicId}`),
    },
  };
});

vi.mock('../../env', () => {
  return {
    env: {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    },
  };
});

describe('UploadService and CloudinaryStorageProvider Retry Strategy', () => {
  let storageProvider: CloudinaryStorageProvider;
  let uploadService: UploadService;

  beforeEach(() => {
    storageProvider = new CloudinaryStorageProvider();
    uploadService = new UploadService(storageProvider);
    vi.clearAllMocks();
  });

  describe('UploadService validations', () => {
    it('should reject file that is too large (> 10MB)', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const result = await uploadService.uploadImage(largeBuffer, 'test.jpg', 'image/jpeg');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('size exceeds 10MB');
    });

    it('should reject unsupported MIME types', async () => {
      const buffer = Buffer.alloc(100);
      const result = await uploadService.uploadImage(buffer, 'test.txt', 'text/plain');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should succeed with allowed type and size', async () => {
      const buffer = Buffer.alloc(100);
      (vi.mocked(cloudinary.uploader.upload_stream).mockImplementation as any)(
        (options: any, callback: any) => {
          const cb = typeof options === 'function' ? options : callback;
          const stream = {
            end: () => {
              if (cb) cb(null, { public_id: 'test-id', secure_url: 'https://test.com/img' } as any);
            },
          };
          return stream as any;
        }
      );

      const result = await uploadService.uploadImage(buffer, 'test.webp', 'image/webp');
      expect(result.isSuccess).toBe(true);
      expect(result.value.publicId).toBe('test-id');
    });
  });

  describe('CloudinaryStorageProvider retry strategy', () => {
    it('should retry on transient errors (e.g. HTTP 429) and eventually succeed', async () => {
      const buffer = Buffer.alloc(100);
      let callCount = 0;

      // First call: rate limit (429), second call: success
      (vi.mocked(cloudinary.uploader.upload_stream).mockImplementation as any)(
        (options: any, callback: any) => {
          const cb = typeof options === 'function' ? options : callback;
          return {
            end: () => {
              callCount++;
              if (cb) {
                if (callCount === 1) {
                  cb({ message: 'Rate limit exceeded', http_code: 429 } as any, undefined);
                } else {
                  cb(null, {
                    public_id: 'test-id-retry',
                    secure_url: 'https://test.com/img',
                  } as any);
                }
              }
            },
          } as any;
        }
      );

      // Override the setTimeout inside retryWithBackoff to speed up test execution
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((fn: any, _delay: number) => {
        fn();
      }) as any;

      const result = await storageProvider.upload(buffer, 'test.jpg', 'image/jpeg');

      global.setTimeout = originalSetTimeout;

      expect(callCount).toBe(2);
      expect(result.publicId).toBe('test-id-retry');
    });

    it('should not retry on validation/non-transient errors (e.g. HTTP 400)', async () => {
      const buffer = Buffer.alloc(100);
      let callCount = 0;

      (vi.mocked(cloudinary.uploader.upload_stream).mockImplementation as any)(
        (options: any, callback: any) => {
          const cb = typeof options === 'function' ? options : callback;
          return {
            end: () => {
              callCount++;
              if (cb) {
                cb({ message: 'Invalid image format', http_code: 400 } as any, undefined);
              }
            },
          } as any;
        }
      );

      await expect(storageProvider.upload(buffer, 'test.jpg', 'image/jpeg')).rejects.toThrow(
        'Invalid image format'
      );
      expect(callCount).toBe(1); // No retry
    });
  });
});
