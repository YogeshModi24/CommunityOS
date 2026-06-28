# API Endpoints

## Reports

### `GET /api/v1/reports`
Fetch all reports, supporting pagination and filtering.

### `POST /api/v1/reports`
Create a new report.
- **Body:** `{ title, description, location, images }`
- **Auth:** Required

## Users

### `GET /api/v1/users/me`
Get the current authenticated user profile.
