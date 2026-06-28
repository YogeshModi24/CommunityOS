# CommunityOS Authentication Architecture

This document describes the design and implementation details of the production-grade authentication and session management system built for CommunityOS in Sprint 1 Phase 1.

## 1. Architectural Principles

The authentication platform is structured according to **Clean Architecture**, **Hexagonal Architecture**, and **Domain-Driven Design (DDD)**.

```
       +-----------------------------------------------+
       |             Presentation Layer                |
       |  (Express Controllers / NextAuth Provider)    |
       +-----------------------+-----------------------+
                               |
                               v [Hexagonal Port]
       +-----------------------+-----------------------+
       |            Application Layer                  |
       |  (Use Cases: Login, Refresh, Logout, RBAC)    |
       +-----------------------+-----------------------+
                               |
                               v [Service Port Contract]
       +-----------------------+-----------------------+
       |             Domain Layer                      |
       |    (UserSession, DeviceInfo, Clock Port)      |
       +-----------------------+-----------------------+
                               |
                               v [Hexagonal Port]
       +-----------------------+-----------------------+
       |          Persistence / Infra Layer            |
       |  (MongoUserSessionRepository, SystemClock)    |
       +-----------------------------------------------+
```

### 1.1 Pure Application Core

The application services, use cases, and repositories are transport-agnostic. They are completely decoupled from HTTP elements such as `req`, `res`, `cookies`, or Next.js headers. The controller layer translates between HTTP primitives and domain DTOs, keeping the core highly testable and reuseable across background jobs and CLI tasks.

---

## 2. Core Entities & Aggregates

### 2.1 UserSession Aggregate

Rather than tracking simple, stateless refresh tokens, we model active user access as a rich `UserSession` aggregate:

- **`id`**: Unique session identifier, also embedded in JWT access tokens.
- **`userId`**: Reference to the authenticating user.
- **`tenantId`**: Contextual isolation identifier (defaults to `"default"`).
- **`refreshTokenHash`**: SHA-256 hash of the cryptographically random refresh token.
- **`device`**: Value object encapsulating `deviceName`, `browser`, `platform`, `os`, and `appVersion`.
- **`ipAddress`**: Last known IP address of the client.
- **`isActive`**: Boolean flag toggled off on logout, remote revocation, or expiration.
- **`version`**: Optimistic concurrency counter.

### 2.2 DeviceInfo Value Object

Represents the client device metadata collected during login or refresh requests. This prevents database scheme drift during future mobile application integrations.

---

## 3. Cryptography & Key Management

### 3.1 Token Entropy

Refresh tokens are high-entropy 512-bit secure random tokens generated via `crypto.randomBytes(64).toString('hex')`.

### 3.2 Opaque Cryptographic Hashing

To prevent token leakage via database leaks, the plain-text refresh token is never stored in the database. Instead, only the SHA-256 hash of the token is saved.
Incoming refresh tokens are hashed and looked up timing-safely:

```ts
const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
```

---

## 4. Final Refinements

### 4.1 Optimistic Session Versioning

A numeric `version` counter is tracked on each `UserSession` document. The version is incremented during:

1. Token rotation on refresh.
2. Device metadata changes.
3. Logout (individual revocation).
4. Logout-all (global revocation).

This prevents race conditions, simplifies eventual distributed deployment token invalidation, and logs audit paths.

### 4.2 Clock Abstraction

Direct calls to `new Date()` are avoided in the AuthService. We utilize a `Clock` service interface:

```ts
export interface Clock {
  now(): Date;
}
```

This enables deterministic testing, mock-ready session expiration audits, and timezone consistency.

### 4.3 Pluggable Metrics

Authentication events are pushed through a port interface `IMetrics`:

- `auth.login.success`
- `auth.login.failed`
- `auth.refresh.success`
- `auth.refresh.failed`
- `auth.logout`
- `auth.session.created`
- `auth.session.revoked`
- `auth.rbac.denied`

The default `LoggerMetrics` adapter writes counts directly to structured JSON logs. This can be swapped for Prometheus/Grafana or OpenTelemetry exporters in production without changing any business service code.
