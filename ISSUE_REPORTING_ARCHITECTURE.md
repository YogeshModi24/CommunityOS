# Issue Reporting Architecture

This document describes the design and implementation of the civic issue reporting system in CommunityOS.

## Clean Architecture Overview

The system strictly adheres to the clean architecture boundaries defined in the CommunityOS blueprint.

```
          [Citizen UI Client]
                  │
                  ▼
         [Express API Router]
                  │
                  ▼
       [Express IssueController]
                  │
                  ▼
       [ReportIssueUseCase]  ◄─────── [IEventBus]
                  │
                  ▼
           [IIssueService]
                  │
                  ▼
          [IIssueRepository]
                  │
                  ▼
       [MongoIssueRepository]
                  │
                  ▼
             [MongoDB]
```

### Components

1. **Controller (`issueController.ts`)**: Parses and validates the request using Zod validation schemas (`createIssueSchema`). Exposes the validated request DTO (`CreateIssueDTO`) to the use case.
2. **Use Case (`ReportIssueUseCase.ts`)**: Orchestrates the business rules for reporting. Dispatches the `IssueCreated` domain event, commits the issue via the service, and queues the background AI analysis job.
3. **Service Layer (`IssueService.ts`)**: Implements user context checks, and delegates database persistence to the repository layer.
4. **Repository (`IIssueRepository` / `MongoIssueRepository`)**: Abstracts raw database operations using Mongoose schemas, handling location coordinates as MongoDB GeoJSON `Point` values and maps DB documents to pure domain aggregates.

---

## Transactional Resilience

To prevent data loss and orphaned storage assets, we enforce transactional boundaries:

1. **Storage-First**: The client first uploads the raw image to the API upload controller (`POST /api/issues/upload`), which uploads to Cloudinary. The client receives the storage metadata.
2. **Database Write Guard**: The client submits the report with the storage metadata to `POST /api/issues`.
3. **Rollback on DB Failure**: If the database persistence fails inside the use case, the uploaded image asset is immediately deleted from Cloudinary via `UploadService.deleteImage()` using its `publicId`. This prevents orphaned cloud media.
4. **Resilient Background Queueing**: If database persistence succeeds but enqueueing the AI analysis worker fails, the issue is **not** deleted. Instead:
   - The issue is saved in the database with status `analysis_pending`.
   - The queue publishing is retried asynchronously (exponentially backed off) in the background.
   - This ensures the citizen's report is never lost due to transient Redis or queue manager failures.

---

## Startup Index Verification

To ensure spatial queries (`$near` on coordinates) perform efficiently and without run-time index errors, indexes are programmatically validated and built during application boot:

- Collection: `issues`
- Indexes:
  - `location: '2dsphere'`
  - `createdAt: -1`
  - `priority_score: -1`
  - `status: 1`
  - `reporter_id: 1`
  - `category: 1`

Successful verification is printed to the system logs on startup.
