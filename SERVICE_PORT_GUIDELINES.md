# Service Port Guidelines (Hexagonal Architecture)

This document outlines the usage of Service Ports (Interfaces) to decouple Use Cases from concrete Service implementations inside **CommunityOS**.

---

## 1. Concept of Ports in Hexagonal Architecture

In Hexagonal Architecture, the application core is isolated from external systems (databases, UI, network protocols, message brokers).

- **Ports**: Interfaces that define the input and output contracts of the application core.
- **Adapters**: Concrete implementations of ports that communicate with external resources or frameworks.

By forcing Use Cases to depend only on **Service Ports (Interfaces)** rather than concrete classes, we ensure that the business orchestrations remain completely decoupled from specific delivery and implementation drivers.

---

## 2. Directory Structure

All service port interfaces must live under the contracts space:

- **Path**: `apps/api/src/services/contracts/`
- **Files**:
  - `IAuthService.ts`
  - `IUserService.ts`
  - `IIssueService.ts`
  - `IVoteService.ts`
  - `IAIService.ts`

---

## 3. Dependency Injection Rules

1. **Depend on Interfaces**: Use Case constructors must accept only interface parameters:
   ```typescript
   export class LoginUserUseCase {
     constructor(private authService: IAuthService) {} // Depends on port interface
   }
   ```
2. **Register Concrete Implementations in Container**: The Dependency Injection registry (`apps/api/src/infra/container.ts`) is responsible for instantiating the concrete classes and mapping them to these ports:
   ```typescript
   const authService = new AuthService(userRepository); // Concrete class
   const loginUserUseCase = new LoginUserUseCase(authService);
   ```

---

## 4. Port Guidelines

1. **Pure Types Only**: Service ports must only reference primitive types, pure domain models (`User`, `Issue`), and `Result` wrappers. Never reference framework-specific classes (e.g. Express Request/Response or BullMQ Job payloads).
2. **Result Envelope**: All port methods that represent business actions must return `Promise<Result<T, E>>` to guarantee uniform exception-free handling across use cases.
