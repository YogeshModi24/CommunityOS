export interface StorageUploadResult {
  originalUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  publicId: string;
}

export interface IStorageProvider {
  upload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageUploadResult>;
  delete(publicId: string): Promise<void>;
}
