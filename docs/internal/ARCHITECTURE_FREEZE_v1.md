# Architecture Freeze v1.0

## CommunityOS Immutable Architecture and Boundary Reference

This document establishes the architecture freeze for **CommunityOS**. Future changes to folders, boundaries, dependencies, naming conventions, or patterns documented here require a formal Architecture Decision Record (ADR) approved by the Architecture Review Board (ARB).

---

## 1. Directory Structure and Workspace Layout

The directory structure is frozen as follows:

- **Applications (`apps/`)**:
  - `apps/web`: Next.js web client for citizen features.
  - `apps/admin`: Next.js backoffice client for moderator features.
  - `apps/api`: Express-based backend API server.
  - `apps/worker`: BullMQ background job processor.
- **Shared Libraries (`packages/`)**:
  - `packages/config`: Immutable environment validation (Zod).
  - `packages/types`: Database-agnostic domain models and DTOs.
  - `packages/validation`: Shareable Zod request validation schemas.
  - `packages/repositories`: Database abstraction interfaces and mappers.
  - `packages/errors`: Decoupled application exception catalog.
  - `packages/logger`: Contextual winston logging transport.
  - `packages/utils`: Result monads and common utilities.
  - `packages/ui`, `packages/hooks`, `packages/tailwind-config`: Shared presentation layers.

---

## 2. Dependency Flow and Import Boundaries

- **Inward Dependency Rule**: All dependencies must point inward according to Clean Architecture:
  `Presentation (Apps) -> Orchestration (Use Cases) -> Core Services / Policies -> Decoupled Domain (Types/Contracts)`
- **ESLint Restrictions**:
  - No direct file imports between workspaces. All shared modules must use the `@community-os/` package name.
  - Presentation layers (`apps/web`, `apps/admin`) cannot import backend packages or database drivers.
  - Packages inside `packages/` cannot import code from `apps/`.
- **Vitest Guardrails**:
  - Controllers cannot import database drivers, repositories, or models directly. They must resolve Use Cases.
  - Use Cases cannot import Express framework symbols.
  - Services cannot import Express framework symbols.

---

## 3. Code Standards & Naming Conventions

- **File Names**:
  - Use Cases must use PascalCase and end with `UseCase` (e.g. `ReportIssueUseCase.ts`).
  - Services must use PascalCase and end with `Service` (e.g. `IssueService.ts`).
  - Ports must use PascalCase, start with `I`, and end with `Service` (e.g. `IIssueService.ts`).
  - Policies must use PascalCase and end with `Policy` (e.g. `PriorityPolicy.ts`).
  - DTOs must use PascalCase and end with `DTO` (e.g. `CreateIssueDTO.ts`).
- **Domain Modeling**:
  - Keep domain entities database-agnostic. Mappers in the repository layer convert database records to domain entities.
- **Error Handling**:
  - Application exceptions must extend `ApplicationError` in `@community-os/errors`.
  - Expected failures (e.g. validations) must return `Result.fail(error)`. Exception throwing is reserved for unexpected runtime errors.
- **Result Monads**:
  - Use Cases return `Result<T, E>`. Controllers process these results to output JSON payloads:
    `res.json({ success: true, data: result.value })` or throw structured `ValidationError(result.error)`.
- **Logging**:
  - Inject logger instances using the `LoggerFactory` interface. No raw `console.*` outputs are allowed.
  - Contextual correlation IDs (`requestId`, `correlationId`) must be propagated using `AsyncLocalStorage`.

---

## 4. Testing & Documentation Standards

- **Testing**:
  - Vitest is the designated runner for unit and architecture fitness checks.
  - All repository queries and data mapping functions require unit test verification.
  - Boundary violations must be checked programmatically in `architecture.test.ts`.
- **Documentation**:
  - Document all architectural modifications inside formal **Architecture Decision Records (ADRs)** using the approved ADR layout.
