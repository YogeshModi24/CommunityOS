# Architectural Decision Record: ADR-0020 – Automated Architecture Fitness Guardrails

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Chief Software Architect
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

As a monorepo grows, it is highly prone to import boundary leaks (e.g. controllers bypassing the service layer to call repositories or Mongoose models directly). Manual reviews are insufficient to catch all infractions before compilation.

## 2. Decision

We decided to establish an **Automated Architecture Fitness check** harness:

- Programmed a program-based boundary validator in `packages/repositories/src/__tests__/architecture.test.ts`.
- It recursively parses controllers, services, use cases, and domain folders, and triggers test failures if prohibited packages (like Mongoose, Redis, BullMQ) are imported inside forbidden layers.
- It runs automatically as part of the standard `npm run test` and git pre-commit verification pipelines.

## 3. Alternatives Considered

### Alternative A: Rely on ESLint boundary rules only

- **Pros**: Quick to set up.
- **Cons**: ESLint configs can be overridden easily using inline comments, and they don't capture complex directory structure dependencies cleanly.

## 4. Consequences

- **Positive**:
  - Compiler-enforced boundary compliance.
  - Zero possibility of database leaks into delivery adapters.
- **Negative**:
  - Requires maintaining the test script path patterns.

## 5. Rollback Strategy

In the event of compilation issues, roll back using Git reset to the approved TSK-006 baseline.
