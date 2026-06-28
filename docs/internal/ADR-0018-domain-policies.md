# Architectural Decision Record: ADR-0018 – Domain Policies (DDD Isolation)

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Chief Software Architect
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

Business logic rules (like priority score calculations or reward point levels) were historically written inside repository layers or directly within controller files. This violated the Single Responsibility Principle and mixed domain calculations with database storage or Express request structures.

## 2. Decision

We decided to introduce **Domain Policies** inside the domain layer (`apps/api/src/domain/policies/`):

- Policies are stateless classes containing pure business calculation methods.
- They have zero knowledge of databases, Express, WebSockets, or network layers.
- Application Services and Use Cases delegate domain equations to these Policies, rather than computing them inline.

## 3. Alternatives Considered

### Alternative A: Write calculations inside Application Services

- **Pros**: Fewer directory splits.
- **Cons**: Services become cluttered with complex math, making them harder to read and test in isolation.

## 4. Consequences

- **Positive**:
  - Clear separation of pure domain formulas from orchestration code.
  - Policy methods are easily unit-testable because they are completely stateless.
- **Negative**:
  - Requires developers to coordinate logic across the services and policy files.

## 5. Rollback Strategy

In the event of compilation issues, roll back using Git reset to the approved TSK-006 baseline.
