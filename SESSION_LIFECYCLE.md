# CommunityOS Session Lifecycle & Token Rotation

This document outlines the detailed lifecycle of a user session and the token rotation mechanism inside CommunityOS.

## 1. Authentication Flows

```
  [Client]                     [Express API Gateway]               [MongoDB / Repositories]
     |                                   |                                     |
     | -- 1. POST /login --------------> |                                     |
     |    (email, password)              | -- 2. Find User / Verify Pass ----> |
     |                                   |                                     |
     |                                   | -- 3. Create UserSession (v=1) ---->|
     |                                   |    (Generates raw/hashed Refresh)   |
     |                                   |                                     |
     | <-- 4. Set Cookie & Send JWT -----|                                     |
     |    (HTTP-only cookie + json JWT)  |                                     |
     |                                   |                                     |
     | -- 5. POST /refresh ------------> |                                     |
     |    (With raw Refresh Token)       | -- 6. Find Session by Hash -------->|
     |                                   |    (Verify active & not expired)    |
     |                                   |                                     |
     |                                   | -- 7. Rotate Token (v = v + 1) ---->|
     |                                   |    (New hash, updates device/IP)    |
     |                                   |                                     |
     | <-- 8. Return New JWT & Cookie ---|                                     |
     |                                   |                                     |
     | -- 9. POST /logout -------------> |                                     |
     |    (With JWT Session ID)          | -- 10. Revoke Session (v = v + 1) ->|
     |                                   |    (Toggles isActive = false)       |
     |                                   |                                     |
     |<-- 11. Clear Cookie & Confirm ----|                                     |
```

---

## 2. Phase-by-Phase Lifecycle Details

### 2.1 Session Creation (Login)

1. The user logs in via credentials (Web dashboard or API/Mobile).
2. `AuthService` verifies user presence and uses `bcrypt.compare` to check the hashed password.
3. Upon validation:
   - A high-entropy `rawRefreshToken` is generated via `crypto.randomBytes(64)`.
   - The token is SHA-256 hashed: `refreshTokenHash`.
   - A `UserSession` record is saved in MongoDB with `isActive: true`, `version: 1`, and expiration set to 7 days.
   - A stateless JWT access token is signed containing:
     - `sub`: User ID
     - `email`: User Email
     - `role`: User Role
     - `tenantId`: Tenant context
     - `sessionId`: Mapped session ID (associating the JWT to the database session)
4. The controller sends the JWT to the client. If the client is a browser (`x-auth-transport` is not `json`), the refresh token is set in a secure, HTTP-only, SameSite=lax cookie. Otherwise, it is returned in the JSON payload (for mobile/API clients).

### 2.2 Token Rotation & Verification (Refresh)

To minimize the window of opportunity for stolen access tokens, access tokens expire in 15 minutes. Clients renew them by calling `/api/users/refresh`.

1. The controller extracts the refresh token from cookies (web) or the request body (mobile).
2. The refresh token is hashed and checked against the database:
   - The repository executes a secure index lookup on `refreshTokenHash`.
   - The session must have `isActive: true` and `expiresAt` in the future.
3. If valid, the system executes **token rotation**:
   - Generates a new `rawRefreshToken` and updates the hash in the database.
   - Checks if client metadata (browser, platform, OS) has changed. If so, updates metadata.
   - **Increments the optimistic version number by 1**.
   - Generates a brand-new access token signed with the updated version context.
4. The new refresh token is returned in the response (either cookie or JSON). The old refresh token is immediately invalidated.

### 2.3 Individual & Global Revocation (Logout / Logout-All)

1. **Logout**: Sets the specific session's `isActive` flag to `false` and increments its `version` by 1. The client's HTTP-only cookies are cleared.
2. **Logout-All**: Invoked during password resets or when a user clicks "Logout from all devices". Toggles `isActive: false` and increments `version` by 1 for all active sessions matching `userId`.

### 2.4 Periodic Session Purging (Worker Cleanup)

To prevent database bloating from stale expired tokens:

- An `ExpiredSessionCleanupJob` is registered in the background scheduler.
- Once every hour, the background worker invokes the repository's `cleanupExpiredSessions()` method.
- This bulk-updates all expired sessions (`expiresAt < now`) to `isActive: false` and logs an audit trail.
