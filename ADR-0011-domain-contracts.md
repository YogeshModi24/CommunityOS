# Architectural Decision Record: ADR-0011 – Domain Contracts & Validation Centralization

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Lead Staff Engineer & CTO
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

Historically, the CommunityOS prototype coupled domain models, database persistence concerns (Mongoose schemas), and HTTP request validation rules directly within individual application routes and controller files.

This coupling presented several architectural hazards:

- Input validation schemas were duplicated or absent, leading to inconsistent API contracts.
- Database-specific details (such as MongoDB `ObjectId` types and Mongoose model hooks) leaked into the presentation layer.
- Moving to a Postgres/Prisma SQL database would require a complete rewrite of the API routes and UI integrations due to lack of standard data transfer contracts.

## 2. Decision

We decided to establish a strict, decoupled Domain Contracts and Input Validation architecture by introducing two new packages in the monorepo:

1. **`@community-os/types`**: Serves as the single source of truth for the application's shared language. It defines pure TypeScript interfaces for Domain Models (e.g., `User`, `Issue`), Data Transfer Objects (DTOs) for request/response payloads, unified API response envelopes, and placeholder definitions for future Value Objects and Domain Events.
2. **`@community-os/validation`**: Centralizes all runtime input validation using **Zod**. All applications must import these schemas to validate request bodies, query parameters, and route parameters. No raw parameters are processed without schema parsing.

Furthermore, we established that validation schemas are completely decoupled from database entities and must only reference pure domain types and primitives.

## 3. Alternatives Considered

### Alternative A: Keep validations local within each application (Express routes/Next.js pages)

- **Pros**: Quick development, local changes are isolated.
- **Cons**: High duplication, drift between API expectations and frontend validation, and lack of compiler-enforced API contracts.

### Alternative B: Adopt class-validator and class-transformer decorators on models

- **Pros**: Declarative decoration directly on class fields.
- **Cons**: Mixes validation logic directly with domain logic, creates compile-time dependencies on decorators, and is less performant than pure schema parsing.

## 4. Consequences

- **Positive**:
  - Zero duplicate schema definitions across the monorepo.
  - Complete decoupling of frontend forms/requests from backend database models.
  - Consistent error formatting: validation failures throw structured `ValidationError` objects that are caught centrally and mapped to HTTP 400 responses.
  - Compilers now catch contract changes immediately across all apps.
- **Negative**:
  - Introduces a small overhead of mapping code (e.g., mapping Mongoose models to domain models, and then domain models to DTO responses).
  - Developers must coordinate changes across two shared packages when modifying field structures.

## 5. Rollback Strategy

In the event of structural compilation failure or runtime regression:

1. Roll back the Git codebase to the TSK-005 baseline.
2. Restore package configurations and dependency boundaries.
3. Re-run `npm install` and `npm run build` to verify restoration.
