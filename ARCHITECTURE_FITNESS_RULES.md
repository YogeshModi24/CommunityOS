# Architecture Fitness Rules

To prevent code decay and protect the decoupled design of **CommunityOS**, all workspaces must adhere to these permanent architectural fitness rules. These guardrails ensure clean layer isolation and decouple business rules from specific framework implementations.

---

## 1. Core Fitness Rules & Import Boundaries

### Rule 1: Controllers must never import database models or ORM packages directly

- **Boundary**: `apps/api/src/controllers/**/*` → **BLOCKED** from importing from Mongoose, Prisma, or `@community-os/repositories/src/mongodb/**/*`.
- **Reason**: Database schemas and persistence engines must be hidden entirely behind Repository interfaces.
- **Allowed Access**: Controllers can only access the Repository Layer through the `RepositoryFactory` and use Abstract Interfaces (e.g., `IUserRepository`).

### Rule 2: Application Services must never import Express or routing symbols

- **Boundary**: `apps/api/src/services/**/*` → **BLOCKED** from importing `express`, `Request`, `Response`, or middleware symbols.
- **Reason**: Business logic services must remain framework-agnostic. They must be executable from BullMQ background jobs, CLI commands, or lambda endpoints without HTTP requests.

### Rule 3: Repository interfaces must remain persistence-agnostic

- **Boundary**: `packages/repositories/src/interfaces/**/*` → **BLOCKED** from referencing `mongoose.Document`, `ObjectId`, Mongoose-specific query builders, or SQL connection strings.
- **Reason**: Interfaces must rely exclusively on Domain Models and basic TypeScript primitives (`string`, `number`, `boolean`).

### Rule 4: Domain Packages must never depend on Infrastructure Libraries

- **Boundary**: `packages/types/**/*` and `packages/validation/**/*` → **BLOCKED** from importing from `@community-os/config`, `@community-os/repositories`, `@community-os/logger`, or `@community-os/errors`.
- **Reason**: Domain specifications represent the pure language of the ecosystem. Infrastructure concerns depend on Domain contracts, not the other way around.

### Rule 5: User Interfaces (UI / Frontend) must never import Backend Internals

- **Boundary**: `apps/web/**/*` and `apps/admin/**/*` → **BLOCKED** from importing from database mappers, repository concrete implementations, Express controllers, or private cryptography utilities.
- **Reason**: Protects client bundles from security risks and runtime reference crashes.

---

## 2. Monorepo Dependency Matrix

The table below illustrates permitted dependencies between layers:

| Layer / Workspace     | Domain (`@types`) | Validation | Error Platform | Logger Platform | Config Platform | Repositories | Apps (Web/Admin) | Apps (API/Worker) |
| :-------------------- | :---------------: | :--------: | :------------: | :-------------: | :-------------: | :----------: | :--------------: | :---------------: |
| **Domain (`@types`)** |         -         |     ❌     |       ❌       |       ❌        |       ❌        |      ❌      |        ❌        |        ❌         |
| **Validation**        |        ✅         |     -      |       ❌       |       ❌        |       ❌        |      ❌      |        ❌        |        ❌         |
| **Error Platform**    |        ✅         |     ❌     |       -        |       ❌        |       ❌        |      ❌      |        ❌        |        ❌         |
| **Logger Platform**   |        ✅         |     ❌     |       ✅       |        -        |       ❌        |      ❌      |        ❌        |        ❌         |
| **Config Platform**   |        ✅         |     ✅     |       ✅       |       ✅        |        -        |      ❌      |        ❌        |        ❌         |
| **Repositories**      |        ✅         |     ❌     |       ✅       |       ✅        |       ✅        |      -       |        ❌        |        ❌         |
| **Apps (Web/Admin)**  |        ✅         |     ✅     |       ✅       |       ❌        |       ✅        |      ❌      |        -         |        ❌         |
| **Apps (API/Worker)** |        ✅         |     ✅     |       ✅       |       ✅        |       ✅        |      ✅      |        ❌        |         -         |

---

## 3. Automation and Verification

These rules are enforced via:

1. **ESLint Boundary Rules**: Enforced at edit/commit time via path patterns in `.eslintrc` configurations.
2. **TypeScript Compilation Checks**: The monorepo `npm run typecheck` run validates compile-time import correctness.
3. **Verification pipeline**: Enforced in the root `verify` script that runs prior to any deployment.
