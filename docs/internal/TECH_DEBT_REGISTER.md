# Tech Debt Register

This document tracks identified architectural issues, design trade-offs, and scheduled remediation work.

---

## Active Registers

### 1. Standalone Session Purge Job

- **Debt Category**: Infrastructure / Worker Management.
- **Description**: The expired session cleanup task runs inside the main Express API process as an hourly `setInterval` timer loop rather than being managed by a centralized cron job or message broker queue.
- **Risk**: If the API scales horizontally to multiple nodes, multiple purge tasks will run concurrently against the MongoDB collection, causing write resource locks.
- **Remediation**: Offload session cleanup to a separate background cron worker inside the `worker` app.
- **Scheduled Sprint**: Sprint 1 Phase 3.

### 2. Mock Storage Provider Implementation

- **Debt Category**: Testing / Environment parity.
- **Description**: In local mock environments, `CloudinaryStorageProvider` simulates uploads by returning a hardcoded Unsplash image URL. It does not store binary buffers locally.
- **Risk**: Visual regression and component testing on the client are restricted to a few static images.
- **Remediation**: Implement a local filesystem storage adapter or spin up a LocalStack S3 emulator.
- **Scheduled Sprint**: Sprint 2 Phase 1.

### 3. NextAuth `any` Type Casts

- **Debt Category**: Code Quality / Types.
- **Description**: Legacy React components and NextAuth callbacks contain a few `(session as any).token` overrides to read custom token attributes.
- **Risk**: Missing type safety in session objects could mask schema mismatches if attributes are renamed in future backend migrations.
- **Remediation**: Extend the NextAuth types (`next-auth.d.ts`) to declare custom token, user, and session contracts.
- **Scheduled Sprint**: Sprint 1 Phase 3.

### 4. Socket.IO Direct Broadcasts

- **Debt Category**: Reliability / Multi-node scaling.
- **Description**: The Socket.IO event handler in `apps/api/src/index.ts` broadcasts messages directly to connected sockets.
- **Risk**: In a clustered, load-balanced multi-node API environment, users connected to Node A will not receive socket updates dispatched by a worker connected to Node B.
- **Remediation**: Introduce a Redis Adapter (`socket.io-redis`) to distribute socket broadcasts across API cluster instances.
- **Scheduled Sprint**: Sprint 1 Phase 4.
