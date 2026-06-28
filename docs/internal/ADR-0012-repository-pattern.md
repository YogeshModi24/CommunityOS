# Architectural Decision Record: ADR-0012 – Repository Pattern & Persistence Abstraction

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Lead Staff Engineer & CTO
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

In the initial CommunityOS prototype, controllers and business operations queried MongoDB directly by importing Mongoose models (e.g., `User` and `Issue`) and running query builders inline.

This direct coupling created several major obstacles:

- **Persistence Lock-in**: Controllers were bound to Mongoose-specific query builders, making it impossible to migrate to other engines (like PostgreSQL/Prisma) without rewriting the entire presentation and routing layer.
- **Testing Impedance**: Testing business logic required spawning a real MongoDB instance or using complex, fragile database mocking libraries (like `mockingoose`), leading to slow and flaky tests.
- **Database Leaks**: Mongodb-specific concepts like `_id` (ObjectIds), mongoose documents, and lazy model population leaked throughout the codebase.

## 2. Decision

We decided to introduce the **Repository Pattern** to abstract database queries behind persistence-agnostic interfaces defined in `@community-os/repositories`:

1. **Persistence-Agnostic Interfaces**: Defined `IUserRepository` and `IIssueRepository` using pure Domain Models (e.g., returning `User` instead of `MongooseDocument`, and accepting `string` instead of `ObjectId`).
2. **Pluggable Factory (RepositoryFactory)**: Introduced a factory that dynamically instantiates repositories based on environment configuration (`engine: "mongo" | "memory"`), enabling the application to swap underlying databases without changing any business or controller code.
3. **Mappers**: Concrete repository implementations use dedicated `mappers` (`mapMongoUser`, `mapMongoIssue`) to convert internal raw database documents into clean domain entities before returning them. No database-specific types leak past the repository boundary.
4. **Transaction Abstraction**: Introduced a lightweight `IUnitOfWork` interface placeholder to reserve the architecture for future transactional integrity under relational engines.

## 3. Alternatives Considered

### Alternative A: Direct Active Record pattern (adding query methods on domain models)

- **Pros**: Simple, highly cohesive.
- **Cons**: Domain classes become coupled to database dependencies and configurations.

### Alternative B: Direct Mongoose usage with dependency injection container

- **Pros**: Avoids mapping code, leverages the full Mongoose query API directly in service classes.
- **Cons**: Services remain locked to MongoDB and Mongoose syntax, blocking a Postgres/Prisma migration.

## 4. Consequences

- **Positive**:
  - The business logic is 100% decoupled from the choice of database.
  - Swapping persistence layers (e.g., Mongoose to Prisma/Postgres) now only requires writing a new repository implementation and mapping logic, without altering services or controllers.
  - Testing is extremely clean and fast; we can mock repositories instantly with Vitest without database connections or network sockets.
- **Negative**:
  - Requires writing explicit mappers between database schemas and domain models.
  - Complex aggregation queries must be mapped to clean interfaces rather than leveraging arbitrary chainable query builders directly in controllers.

## 5. Rollback Strategy

In the event of database access bottlenecks or critical mapping bugs:

1. Revert to the approved Git baseline `v0.1.0-tsk005`.
2. Clean compiled caches and verify standard dev servers start.
