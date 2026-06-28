# Database Architecture

CommunityOS uses **MongoDB** as its primary database, interfaced via **Prisma ORM**.

## Key Models
- `User`: Represents citizens and admins.
- `Report`: The core entity for civic issues.
- `Comment`: User interaction on reports.

## Prisma Setup
The schema is defined in `packages/database/prisma/schema.prisma`. We use MongoDB replica sets to ensure high availability and support for Prisma transactions.
