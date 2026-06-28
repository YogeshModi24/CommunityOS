# Image Upload Guide

This document describes how media uploads are validated, stored, and managed in CommunityOS.

## Core Upload Constraints

All image uploads pass through strict size and format validation inside `UploadService` before hitting the storage provider:

- **Max Size**: 10MB (`MAX_SIZE = 10 * 1024 * 1024` bytes).
- **MIME Types Allowed**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/heic`

If any validation constraint fails, a `Result.fail` is returned immediately, preventing any cloud storage interactions.

---

## Storage Provider Abstraction (`IStorageProvider`)

To isolate the business logic from third-party storage services, we define the `IStorageProvider` port:

```typescript
export interface IStorageProvider {
  upload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageUploadResult>;

  delete(publicId: string): Promise<void>;
}
```

The primary adapter is `CloudinaryStorageProvider`, which integrates the Cloudinary SDK. A simulated mock mode is triggered if credentials are empty or set to `mock`.

---

## Cloudinary Retry Strategy

The `CloudinaryStorageProvider` implements resilient uploads utilizing exponential backoff:

1. **Transient Failure Verification**:
   - HTTP 429 (Rate Limit Exceeded)
   - HTTP 500, 503 (Server Errors)
   - Network timeouts and socket connections (`eai_again`, etc.)
2. **Backoff Delay**:
   - Starting delay: 1000ms.
   - Max retries: 3.
   - Delay doubles on each retry (1000ms -> 2000ms -> 4000ms).
3. **No-Retry on Validations**:
   - HTTP 400 (Bad request, unsupported file format, invalid payload structure).
   - Validation failures throw exceptions immediately to prevent futile loops.

---

## Transactional Cleanup

To avoid orphan image assets in our cloud storage:

- If `ReportIssueUseCase` creates an issue and database persistence fails, a cleanup function `UploadService.deleteImage(publicId)` is immediately triggered.
- The storage public ID is extracted and the asset is removed from the cloud provider.

---

## Performance SLA Target

- **Target**: Image Upload < 3 seconds.
- **Enforcement**: If upload duration exceeds 3 seconds, a structured performance warning is logged (`Image upload exceeded SLA target of 3s`).
