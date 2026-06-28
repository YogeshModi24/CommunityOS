# Architectural Decision Record: ADR-0013 – Application Service Layer

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Lead Staff Engineer & CTO
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

In the prototype design, Express route controllers handled multiple concerns simultaneously:

- Parsing incoming HTTP requests and checking cookies/headers.
- Executing domain business rules (such as computing AI priority scores, updating user points, or sorting coordinates).
- Instantiating and saving data to the database.
- Broadcasting updates via Socket.io and triggering background workers.

This lack of separation violated the Single Responsibility Principle, making the business logic difficult to test, reuse (e.g., in offline scripts or job workers), or adapt to alternate frameworks.

## 2. Decision

We decided to introduce a formal **Application Service Layer** inside `apps/api/src/services` (`UserService`, `IssueService`, `VoteService`):

1. **Controller Role**: Controllers are strictly presentation adapters. They parse request inputs using `@community-os/validation` schemas, delegate execution to the appropriate service class, and format standard HTTP JSON responses.
2. **Service Role**: Services contain the core use-case orchestrations and business logic. They depend only on abstract Repository interfaces, the Logger platform, and Domain Entities.
3. **Infrastructure Decoupling**: Services are completely unaware of HTTP requests, cookies, response streams, or Express-specific objects. This allows them to be called from the HTTP API controllers, the BullMQ background workers (`aiWorker.ts`), or administrative seed/migration scripts with identical behavior.

## 3. Alternatives Considered

### Alternative A: Keep business logic inside controllers

- **Pros**: Fewer files to maintain, simpler structure for small APIs.
- **Cons**: Duplicate logic between background worker jobs (like the AI worker) and HTTP endpoints; impossible to test business rules without mocking the Express request/response pipeline.

### Alternative B: Put business logic inside the Domain Entities

- **Pros**: Rich Domain Model, high cohesion of data and behavior.
- **Cons**: Domain models become polluted with side-effects like calling background job queues, sending socket notifications, or writing database logs.

## 4. Consequences

- **Positive**:
  - Services are completely framework-agnostic. They can be reused in serverless functions, CLI tools, or different web frameworks.
  - Business rules can be unit-tested directly without setting up supertest or simulating HTTP middleware.
  - Consistent execution of business rules across all API routes and background worker jobs (e.g., the AI worker uses the exact same `IssueService` to update issues).
- **Negative**:
  - Adds one extra layer of delegation, slightly increasing the call stack depth.
  - Requires explicit passing of context parameters (such as the authenticated `userId`) into service calls.

## 5. Rollback Strategy

In the event of critical routing issues or latency regressions:

1. Revert to the approved Git baseline `v0.1.0-tsk005`.
2. Clean compiled caches and verify standard dev servers start.
