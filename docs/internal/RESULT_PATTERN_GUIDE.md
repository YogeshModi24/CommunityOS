# Result Pattern Guide

This document defines the rules and best practices for adopting the `Result<T, E>` monad pattern in the **CommunityOS** codebase.

---

## 1. Core Principle: No Throwing for Expected Failures

In Clean Architecture and functional programming, we differentiate between two types of failures:

1. **Expected Business Failures**: Scenarios that occur due to invalid user inputs, credential mismatches, duplicate data, or state machine violations (e.g., trying to reopen a locked issue).
   - **Remediation**: Return a `Result` object representing failure (`Result.fail(error)`).
2. **Unexpected System Exceptions**: Scenarios that represent hardware issues, database outages, lost sockets, or programmer errors (e.g., database connection timeout, JSON parsing crashes).
   - **Remediation**: Throw a standard exception/error to be caught by the global error handler.

---

## 2. Using the `Result` Class

The `@community-os/utils` package exports `Result<T, E = string>` to wrap success or failure outcomes.

### Success Case

```typescript
import { Result } from '@community-os/utils';

// Returns a successful Result containing a user
const result = Result.ok(user);

console.log(result.isSuccess); // true
console.log(result.isFailure); // false
console.log(result.value); // User object
```

### Failure Case

```typescript
import { Result } from '@community-os/utils';

// Returns a failed Result containing an error string
const result = Result.fail('Invalid credentials');

console.log(result.isSuccess); // false
console.log(result.isFailure); // true
console.log(result.error); // "Invalid credentials"
```

---

## 3. Propagation through Layers

### Application Services (Port / Implementation)

Services should compute business outcomes and return `Result` wrappers:

```typescript
export class UserService implements IUserService {
  async getMe(userId: string): Promise<Result<User, string>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail('User not found');
    }
    return Result.ok(user);
  }
}
```

### Use Case Layer

Use cases orchestrate services and propagate results or construct failures:

```typescript
export class LoginUserUseCase {
  constructor(private authService: IAuthService) {}

  async execute(dto: LoginRequestDTO): Promise<Result<LoginResponseDTO, string>> {
    return this.authService.login(dto);
  }
}
```

### Controllers (Express / Delivery Adapters)

Controllers execute use cases, check success/failure status, and translate the outcome to standard HTTP response structures:

```typescript
import { ValidationError } from '@community-os/errors';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const loginUseCase = container.resolve<LoginUserUseCase>(LoginUserUseCase);
    const result = await loginUseCase.execute(req.body);

    if (result.isFailure) {
      // Maps expected failure to HTTP 400 validation error caught by middleware
      throw new ValidationError(result.error);
    }

    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}
```
