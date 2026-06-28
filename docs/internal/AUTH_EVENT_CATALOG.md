# CommunityOS Authentication Event & Metrics Catalog

This document catalog lists the structured audit logs and metrics counters exposed by the authentication platform in CommunityOS.

## 1. Structured Logging Context

Every authentication log event includes a standard telemetry metadata object containing:

- `service`: `"api"` or `"worker"`.
- `environment`: The current deployment environment (`"local"`, `"development"`, `"production"`).
- `requestId`: Trace identifier mapping to the individual API gateway request lifecycle.
- `correlationId`: Correlation identifier propagated across workers and queues.
- `userId`: Reference ID of the operating user (if authenticated).
- `tenantId`: Active tenant database scope (defaults to `"default"`).
- `sessionId`: Reference ID of the active `UserSession` (if resolved).

---

## 2. Event & Metrics Catalog

### 2.1 auth.login.success

- **Metric Key**: `auth.login.success`
- **Severity**: `INFO`
- **Description**: Triggered when a user successfully enters their credentials and obtains a session token.
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "tenantId": "tenant-name",
    "sessionId": "session-uuid"
  }
  ```

### 2.2 auth.login.failed

- **Metric Key**: `auth.login.failed`
- **Severity**: `WARN`
- **Description**: Triggered when a login attempt fails (e.g. invalid password, non-existent email).
- **Payload Metadata**:
  ```json
  {
    "tenantId": "tenant-name"
  }
  ```

### 2.3 auth.refresh.success

- **Metric Key**: `auth.refresh.success`
- **Severity**: `INFO`
- **Description**: Triggered when a client successfully rotates their refresh token and receives a new access token.
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "tenantId": "tenant-name",
    "sessionId": "session-uuid"
  }
  ```

### 2.4 auth.refresh.failed

- **Metric Key**: `auth.refresh.failed`
- **Severity**: `WARN`
- **Description**: Triggered when a refresh token lookup fails (e.g., token expired, already revoked, or timing-safe verify mismatch).
- **Payload Metadata**: None (anonymous context to prevent leak).

### 2.5 auth.logout

- **Metric Key**: `auth.logout`
- **Severity**: `INFO`
- **Description**: Triggered when a user manually logs out of a device.
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "tenantId": "tenant-name",
    "sessionId": "session-uuid"
  }
  ```

### 2.6 auth.session.created

- **Metric Key**: `auth.session.created`
- **Severity**: `INFO`
- **Description**: Triggered when a new database `UserSession` document is saved.
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "tenantId": "tenant-name",
    "sessionId": "session-uuid"
  }
  ```

### 2.7 auth.session.revoked

- **Metric Key**: `auth.session.revoked`
- **Severity**: `INFO`
- **Description**: Triggered when a session is toggled to inactive (either via individual logout, remote revocation, or global logout-all).
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "tenantId": "tenant-name",
    "sessionId": "session-uuid"
  }
  ```

### 2.8 auth.rbac.denied

- **Metric Key**: `auth.rbac.denied`
- **Severity**: `WARN`
- **Description**: Triggered when an authenticated user attempts to access a route for which they do not possess the required role.
- **Payload Metadata**:
  ```json
  {
    "userId": "user-uuid",
    "role": "citizen",
    "allowedRoles": ["admin", "authority"]
  }
  ```
