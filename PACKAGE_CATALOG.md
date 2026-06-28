# Package Catalog

## CommunityOS Workspaces and Package Reference Directory

This catalog details the purpose, ownership, API signatures, dependencies, and future roadmaps for all 13 package workspaces inside the `packages/` directory.

---

## 1. @community-os/config

- **Purpose**: Centralized environment variable validation and configuration schemas.
- **Owner**: Infrastructure / DevOps
- **Public API**: `src/index.ts`
- **Exported Symbols**: `env`, `serverEnvSchema`, `clientEnvSchema`, `SecretResolver`.
- **Internal-only Modules**: `validators/`, `loader/`.
- **Dependencies**: `@community-os/utils`, `zod`.
- **Consumers**: `apps/web`, `apps/api`, `apps/worker`, `apps/admin`.
- **Future Roadmap**: Implement AWS Secrets Manager and Vault resolvers in Sprint 2.

---

## 2. @community-os/repositories

- **Purpose**: Database connection wrappers and abstract persistence contracts.
- **Owner**: Technical Lead / Database Administrator
- **Public API**: `src/index.ts`
- **Exported Symbols**: `IIssueRepository`, `IUserRepository`, `IUnitOfWork`, `RepositoryFactory`.
- **Internal-only Modules**: `mongodb/models/`, `mongodb/mappers.ts`.
- **Dependencies**: `@community-os/types`, `@community-os/errors`, `@community-os/logger`, `mongoose`.
- **Consumers**: `apps/api`.
- **Future Roadmap**: Implement PostgreSQL and Prisma ORM client mappings in Sprint 2.

---

## 3. @community-os/types

- **Purpose**: Decoupled domain models, DTO interfaces, and application events.
- **Owner**: Core Product Architect
- **Public API**: `src/index.ts`
- **Exported Symbols**: `Issue`, `User`, `CreateIssueDTO`, `LoginResponseDTO`, `IssueCategory`, `IssueStatus`.
- **Internal-only**: None (Pure data models).
- **Dependencies**: None (Leaf package).
- **Consumers**: `api`, `web`, `worker`, `admin`, `validation`, `repositories`.
- **Future Roadmap**: Expand types to support real-time notification events in Sprint 2.

---

## 4. @community-os/validation

- **Purpose**: Safe Zod request parsing validation definitions.
- **Owner**: Core Architect
- **Public API**: `src/index.ts`
- **Exported Symbols**: `LoginSchema`, `RegisterSchema`, `CreateIssueSchema`, `ListIssuesSchema`.
- **Internal-only**: None.
- **Dependencies**: `@community-os/types`, `zod`.
- **Consumers**: `apps/api`, `apps/web`, `apps/admin`.
- **Future Roadmap**: Add custom regex validations for address and region-specific ward names.

---

## 5. @community-os/errors

- **Purpose**: Centralized application exception hierarchies.
- **Owner**: Core Architecture Lead
- **Public API**: `src/index.ts`
- **Exported Symbols**: `ApplicationError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`.
- **Internal-only**: None.
- **Dependencies**: None.
- **Consumers**: `logger`, `repositories`, `api`, `worker`, `web`.
- **Future Roadmap**: Add localized error messages for multi-language citizen clients.

---

## 6. @community-os/logger

- **Purpose**: Structured logging provider.
- **Owner**: Observability Engineer
- **Public API**: `src/index.ts`
- **Exported Symbols**: `LoggerFactory`, `ILogger`, `logger`, `runWithContext`.
- **Internal-only**: `adapters/ConsoleLogger`, `adapters/WinstonLogger`.
- **Dependencies**: `@community-os/errors`, `winston`.
- **Consumers**: `api`, `worker`, `repositories`.
- **Future Roadmap**: Hook up Datadog logging transport in Sprint 3.

---

## 7. @community-os/utils

- **Purpose**: Shared helpers, Result monads, and utilities.
- **Owner**: DX Lead
- **Public API**: `src/index.ts`
- **Exported Symbols**: `Result`, `Either`.
- **Internal-only**: None.
- **Dependencies**: None.
- **Consumers**: `api`, `config`, `validation`, `repositories`.
- **Future Roadmap**: Expand with common array parsing and geometry helpers.

---

## 8. Frontend Utility Packages

### 8.1 @community-os/ui

- **Purpose**: Shareable layout components. Binds styles to Tailwind.
- **Consumers**: `apps/web`, `apps/admin`.

### 8.2 @community-os/hooks

- **Purpose**: Shareable React hooks (e.g. Geolocation access).
- **Consumers**: `apps/web`, `apps/admin`.

### 8.3 @community-os/tailwind-config

- **Purpose**: Global style theme configurations.
- **Consumers**: `@community-os/ui`, `web`, `admin`.

### 8.4 @community-os/typescript-config

- **Purpose**: Unified compiler rules (`tsconfig.json` configurations).

### 8.5 @community-os/eslint-config

- **Purpose**: Shared linter definitions.
