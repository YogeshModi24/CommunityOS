# Queue Processing Guide: CommunityOS Background Jobs

This guide outlines job queue configurations, worker topologies, failure modes, and retry strategies used in CommunityOS.

---

## 1. Queue Definitions

Background tasks are managed using the **BullMQ** library, which leverages **Redis** as a persistent, high-throughput message backing store.

### 1.1 `ai-analysis` Queue

- **Purpose**: Processes visual media uploads using Vision AI, classifying category, severity, hazardous status, and extracting descriptions.
- **Payload Structure**:
  ```typescript
  interface AIJobData {
    issueId: string;
    imageUrl: string;
    reporterId: string;
    coordinates: [number, number];
    correlationContext?: {
      correlationId?: string;
      requestId?: string;
      userId?: string;
      tenantId?: string;
    };
  }
  ```
- **Concurrency Limit**: `2` concurrent jobs per worker thread.

---

## 2. In-Memory Mock Queue Fallback

For local testing environments where a Redis cluster is unavailable:

- If `REDIS_URL` matches `mock` or is unset, `apps/api` instantiates a `MockQueue` wrapper.
- The `MockQueue` simulates async queuing by scheduling a `setTimeout` callback to execute `processJob(data)` after `3000ms`.
- The worker logs `Mock mode (In-Memory timeouts active)` and maintains a standard heartbeat.

---

## 3. Failure & Retry Management

In production, network glitches or AI provider rate limits can cause processing to fail:

- **Default Job Options**:
  - **Attempts**: `3` retries.
  - **Backoff Plan**: Exponential delay (`delay * 2` starting from `2000ms`).
  - **Retention Policy**: Keeps up to `100` completed jobs and `50` failed jobs in history for inspection.
- **Transactional Reporting Safety**:
  - If database registration succeeds but Redis queue submission fails during issue reporting, the platform marks the issue as `analysis_pending` and triggers an async retry pool (up to 3 times) to guarantee the citizen's report is never lost.

---

## 4. Heartbeat & Metrics Audits

The worker monitors queue depths continuously. Every **1 minute**, it logs active queue states to aid DevOps observability:

- **Active Jobs**: Currently processing.
- **Waiting Jobs**: Queued in Redis waiting for a thread.
- **Failed Jobs**: Errored out.
- **Completed Jobs**: Successfully finalized.
