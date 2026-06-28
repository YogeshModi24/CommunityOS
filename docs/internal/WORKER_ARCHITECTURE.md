# Worker Architecture: CommunityOS Background Process

This document details the isolated background processing worker architecture of CommunityOS.

---

## 1. Architectural Topology

To maintain high API availability and prevent blocking the Node.js event loop during intensive operations, the CommunityOS platform isolates tasks into separate execution processes:

```mermaid
graph TD
  A[apps/web (Next.js Client)] -->|HTTP Request| B[apps/api (Express Server)]
  B -->|Enqueue Job| C[(Redis Queue / BullMQ)]
  D[apps/worker (Node.js Background Process)] -->|Poll / Consume Job| C
  D -->|Execute Use Case| E[AI Analysis Use Case]
  E -->|AI Inference| F[OpenAI / Vision APIs]
  E -->|Save Results| G[(MongoDB Database)]
  E -->|Publish Event| H[EventBus]
  B -->|Subscribe Event| H
  B -->|WebSockets| A
```

---

## 2. Process Separation Controls

- **API Process (`apps/api`)**: Responsible only for handling inbound HTTP requests, enforcing auth cookies, executing lightweight queries, pushing jobs to the Redis BullMQ, and managing Socket.IO connections. It does **not** consume any queues or run heavy background timeouts.
- **Worker Process (`apps/worker`)**: A headless, non-HTTP server execution target that spins up on container boot. It establishes its own connections to MongoDB and Redis, instantiates the Dependency Injection container, starts the BullMQ `Worker` to consume tasks, and runs periodic database cleanup jobs.

---

## 3. Dependency Injection Containment

The worker reuses the existing `container` (`apps/api/src/infra/container.ts`) via TypeScript relative paths. This allows the worker to resolve:

- `AnalyzeIssueUseCase`
- `IssueService`
- `AIService`
- `UserService`
- `EventEmitterEventBus`

Since the DI container only constructs services and domain use cases (completely decoupled from routing frameworks or Express objects), it is 100% safe to resolve and execute within the worker process.

---

## 4. Graceful Shutdown Design

When a shutdown signal (`SIGINT` or `SIGTERM`) is received, the worker performs a sequential shutdown:

1. **Stop worker**: `activeWorker.close()` is invoked to notify BullMQ. The worker stops pulling new jobs and waits for existing jobs to finish executing.
2. **Close monitor queue**: `monitorQueue.close()` stops monitoring stats.
3. **Disconnect Redis**: `redisClient.quit()` terminates active connection pools gracefully.
4. **Disconnect Mongoose**: `mongoose.disconnect()` disconnects the database cleanly, verifying no transactions or queries are left orphan.
5. **Exit Process**: Terminate the runtime thread with exit code `0`.
