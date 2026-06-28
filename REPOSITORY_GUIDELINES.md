# Repository Pattern & Persistence Guidelines

This document provides architectural standards and code examples for implementing, testing, and scaling persistence adapters in the **CommunityOS** codebase.

---

## 1. Principles of Persistence Decoupling

To safeguard the application from vendor lock-in and simplify testing, all persistence layers must strictly respect the following boundaries:

1. **Persistence Agnosticism**: Repository interfaces must accept and return only pure Domain Models (defined in `@community-os/types`). They must never expose database-specific types (e.g., MongoDB `ObjectId`, `Document`, Mongoose Query chains, or Prisma client instances).
2. **Dynamic Ingestion**: Applications must not import repository classes directly. All repositories must be instantiated using the central `RepositoryFactory`.
3. **No Singleton Leakage**: Avoid exporting singleton repositories from packages. This ensures that the engine can be configured dynamically (e.g., using different credentials, loggers, or connecting to an in-memory database for testing).

---

## 2. Core Repository Lifecycle

### Architecture Overview

```
Controller (Express)
       ↓ (Parses inputs)
Application Service (UserService / IssueService)
       ↓ (Orchestrates use-cases)
Repository Interface (IUserRepository / IIssueRepository)
       ↓ (Persistence-agnostic methods)
Concrete Implementation (MongoUserRepository / PrismaUserRepository)
       ↓ (Query builders)
Database Engine (MongoDB / PostgreSQL)
```

---

## 3. Data Mapping

Every concrete repository must implement a mapping layer that converts raw database records to pure domain models.

### Example Mapper

```typescript
import { User } from '@community-os/types';

export function mapMongoUser(doc: any): User {
  if (!doc) return null as any;
  return {
    id: doc._id ? doc._id.toString() : '',
    name: doc.name,
    email: doc.email,
    role: doc.role,
    ward: doc.ward,
    points: doc.points ?? 0,
    issues_reported: doc.issues_reported ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
```

---

## 4. Instantiation via `RepositoryFactory`

The `RepositoryFactory` uses a clean dynamic config object to return database-specific implementations.

### Instantiation Pattern

```typescript
import { RepositoryFactory } from '@community-os/repositories';
import { logger } from './logger';

const repositories = RepositoryFactory.create({
  engine: 'mongo', // or 'prisma', 'memory' in the future
  config: {
    // database connection parameters
  },
  logger,
});

const userRepo = repositories.user;
const issueRepo = repositories.issue;
```

---

## 5. Writing Independent Unit Tests

Repository implementations must be unit-tested without opening real database connections. In `@community-os/repositories`, we use **Vitest** to mock database clients.

### Mocking Mongoose in Vitest

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserMongoose from '../mongodb/models/User';
import { MongoUserRepository } from '../mongodb/MongoUserRepository';

// Mock the model before test suite execution
vi.mock('../mongodb/models/User', () => {
  return {
    default: {
      findById: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
    },
  };
});

describe('MongoUserRepository', () => {
  let userRepo: MongoUserRepository;

  beforeEach(() => {
    userRepo = new MongoUserRepository();
    vi.clearAllMocks();
  });

  it('should retrieve a user and map properties successfully', async () => {
    const mockUserDoc = {
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@demo.com',
      role: 'citizen',
      points: 5,
    };

    // Mock .lean() call chaining
    vi.mocked(UserMongoose.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUserDoc),
    } as any);

    const result = await userRepo.findById('507f1f77bcf86cd799439011');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('507f1f77bcf86cd799439011');
    expect(result?.name).toBe('John Doe');
  });
});
```

---

## 6. Development Rules for relational SQL (Future)

When implementing the upcoming `PrismaRepository` adapter:

1. Create a `src/prisma/` folder within the `@community-os/repositories` workspace.
2. Build the `PrismaUserRepository` and `PrismaIssueRepository` mappings.
3. Bind the implementations under the `RepositoryFactory` configuration block.
4. Ensure no database-specific classes leak; keep the services completely untouched.
