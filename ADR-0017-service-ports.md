# Architectural Decision Record: ADR-0017 – Service Ports (Hexagonal Architecture)

- **Status**: APPROVED
- **Date**: June 26, 2026
- **Author**: Chief Software Architect
- **Deciders**: Architecture Review Board (ARB)

---

## 1. Context

In a Clean Architecture layout, concrete implementation classes should not be hard-bound to orchestration components. If a Use Case class imports a concrete service class directly, it limits testability (making it hard to mock the service) and couples the use cases to specific utility implementations.

## 2. Decision

We decided to introduce **Service Ports (Interfaces)** inside the application core.

- Use Cases must reference and import only interfaces (e.g. `IUserService`, `IAuthService`) under `apps/api/src/services/contracts/`.
- Concrete service adapters (e.g. `UserService`, `AuthService`) implement these interfaces.
- The dependency injection container is responsible for instantiating the services and binding them to the use case constructor parameters.

## 3. Alternatives Considered

### Alternative A: Direct class references in Use Cases

- **Pros**: Fewer interface files to create and maintain.
- **Cons**: Severe coupling, mocks require overriding full class prototypes, and swapping service drivers (e.g. swapping AIService provider) is difficult.

## 4. Consequences

- **Positive**:
  - Full compliance with the Dependency Inversion Principle.
  - Mock services can be injected instantly in tests.
  - Ready for the container registration model in TSK-008.
- **Negative**:
  - Increases the total number of files due to the introduction of interface declarations.

## 5. Rollback Strategy

In the event of compilation issues, roll back using Git reset to the approved TSK-006 baseline.
