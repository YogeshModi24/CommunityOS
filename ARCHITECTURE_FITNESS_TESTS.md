# Architecture Fitness Tests

This document outlines the automated testing harness that enforces import boundaries and prevents architectural decay within **CommunityOS**.

---

## 1. Principles of Automated Fitness Verification

As a repository scales, it is prone to structural decay (e.g. controllers importing database drivers directly, or UI components referencing server-side libraries).

To guarantee boundary compliance, we run programmatic checkers checking imports inside:

- **Controllers**
- **Services**
- **Use Cases**
- **Domain Entities**

---

## 2. Test File Location and Setup

The test file is hosted inside:

- **Path**: `packages/repositories/src/__tests__/architecture.test.ts`
- **Execution Engine**: Vitest

It runs automatically when `npm run test` is executed inside the repository workspace (or during monorepo checking `npm run verify`).

---

## 3. Automated Guardrails Enforced

| Directory / Layer | Prohibited Imports / Wording                                                 | Reason                                                                                            |
| :---------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Controllers**   | `mongoose`, `ioredis`, `cloudinary`, `bullmq`, `models/User`, `models/Issue` | Controllers must only delegate to Use Cases and cannot query databases or cache clients directly. |
| **Services**      | `express`                                                                    | Services must remain transport-agnostic.                                                          |
| **Use Cases**     | `express`                                                                    | Use Cases must remain transport-agnostic.                                                         |
| **Domain**        | `mongoose`, `ioredis`, `bullmq`                                              | The Domain must have zero infrastructure dependencies.                                            |

---

## 4. Running the Tests

To run the checks locally:

```bash
npm run test --workspace=packages/repositories
```

If any developer accidentally introduces a forbidden import, the test suite will fail during pre-commit hooks, preventing compile drift.
