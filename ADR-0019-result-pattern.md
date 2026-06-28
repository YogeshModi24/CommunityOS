# Architectural Decision Record: ADR-0019 – Result Monad Pattern

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Chief Software Architect
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

Historically, the application threw exceptions (e.g. `throw new ValidationError(...)`) for expected business failures (like invalid logins or wrong status values). In a clean design, exceptions represent unexpected system errors, whereas business outcomes (success or failure) are expected domain occurrences that should be returned as data.

## 2. Decision

We decided to introduce the **Result Pattern** using a type-safe `Result<T, E>` monad wrapper class:

- Methods representing business operations return `Result.ok(value)` or `Result.fail(error)`.
- Use Cases and Services propagate Result models instead of using try/catch blocks for validations.
- HTTP Controllers evaluate the returned Result objects and translate failures into appropriate HTTP responses.

## 3. Alternatives Considered

### Alternative A: Continue throwing custom validation errors

- **Pros**: Matches standard Express paradigm.
- **Cons**: High CPU overhead of generating stack traces for expected input validation failures, cluttered try/catch logic, and unpredictable API exception patterns.

## 4. Consequences

- **Positive**:
  - Eliminates try/catch boilerplate for business rules validations.
  - Strictly type-safe outcomes.
  - Predictable control flow.
- **Negative**:
  - Requires explicit checking of `result.isFailure` at layer boundaries.

## 5. Rollback Strategy

In the event of compilation issues, roll back using Git reset to the approved TSK-006 baseline.
