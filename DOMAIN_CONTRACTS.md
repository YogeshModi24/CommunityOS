# Domain Contracts & Validation Reference

This document serves as the official reference for the shared language, data transfer contracts, and validation rules of the **CommunityOS** platform.

---

## 1. Domain Models (`@community-os/types`)

Domain models represent the core business entities. They are pure TypeScript interfaces containing zero database-specific annotations (no Mongoose decorators, ObjectIds, or Prisma schema attributes).

### User Domain Model

Represents a registered user within the community.

- **Path**: `packages/types/src/domain/user.ts`
- **Fields**:
  - `id`: string (UUID or Mongoose stringified ObjectId)
  - `name`: string
  - `email`: string
  - `password`: string (optional, selected explicitly on login verification)
  - `role`: `'citizen' | 'authority' | 'admin'`
  - `ward`: string (optional)
  - `points`: number (default 0)
  - `issues_reported`: number (default 0)
  - `createdAt`: Date
  - `updatedAt`: Date

### Issue Domain Model

Represents a public citizen-reported issue.

- **Path**: `packages/types/src/domain/issue.ts`
- **Fields**:
  - `id`: string
  - `title`: string
  - `description`: string
  - `category`: string (e.g. `'pothole'`, `'garbage'`, `'street_light'`, `'water_leak'`)
  - `severity`: number (1 to 5)
  - `status`: `'open' | 'in_progress' | 'resolved' | 'duplicate'`
  - `priority_score`: number (calculated dynamically)
  - `location`: `{ type: 'Point', coordinates: [number, number] }` (Longitude, Latitude)
  - `address`: string (optional)
  - `ward`: string (optional)
  - `media`: Array of `{ url: string, public_id: string }`
  - `ai_category`: string (optional)
  - `ai_confidence`: number (optional)
  - `ai_description`: string (optional)
  - `hazardous`: boolean
  - `votes`: number (default 0)
  - `voter_ids`: string[]
  - `reporter_id`: string | PopulatedReporter
  - `status_history`: Array of `{ status: string, note: string, timestamp: Date }`
  - `createdAt`: Date
  - `updatedAt`: Date

---

## 2. Data Transfer Objects (DTOs)

DTOs establish the strict contract for data entering or leaving the system.

- **Authentication DTOs** (`src/dto/auth.ts`):
  - `LoginRequestDTO`: `{ email, password }`
  - `LoginResponseDTO`: `{ user: Omit<User, 'password'>, token }`
- **Issue DTOs** (`src/dto/issue.ts`):
  - `CreateIssueDTO`: Core details required to register a new issue.
  - `UpdateIssueStatusDTO`: Payload containing new status and explanatory note.
  - `VoteAdjustmentDTO`: Target action to register/remove user vote.
  - `GetNearbyIssuesQueryDTO`: Coordinates and distance filters.
  - `ListIssuesQueryDTO`: Pagination, sorting, category, status, and search filters.

---

## 3. Input Validation Schemas (`@community-os/validation`)

All payloads entering the application controllers are run through Zod validators to ensure correctness at the API entry gate.

### Auth Schemas

- **`loginSchema`**: Validates email format and minimal password length requirements.

### Issue Schemas

- **`createIssueSchema`**: Enforces rules for title length (min 5), description, coordinates boundaries, category verification, and optional media blocks.
- **`updateIssueStatusSchema`**: Restricts status changes to allowed transitions (`'open' | 'in_progress' | 'resolved' | 'duplicate'`) and requires a descriptive note.
- **`getNearbyIssuesSchema`**: Coerces coordinates (Latitude/Longitude) to numeric bounds and enforces maximum search distance.
- **`listIssuesQuerySchema`**: Enforces numeric pagination limits (`page`, `limit`), optional search queries, category filters, and status criteria.

---

## 4. Design Guidelines for New Contracts

1. **Keep it Pure**: Do not import database drivers, model configurations, or Express types into the `@community-os/types` or `@community-os/validation` workspaces.
2. **DTO Separation**: Never expose domain models directly in request payloads. Define a specific DTO even if fields look identical, ensuring the domain layer can evolve without breaking public API endpoints.
3. **Zod Coercion**: When parsing query parameters (which arrive as strings), use Zod's coercion features (e.g., `z.coerce.number()`) to safely handle numeric variables.
