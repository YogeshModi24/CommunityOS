# Refactor Matrix: CommunityOS Sprint 0.1

- **Version**: 1.0.0
- **Status**: Completed
- **Owner**: Lead Staff Engineer & CTO

This document details the refactoring decisions and justifications for major codebase files during the migration.

| File Path                                     | Action       | Justification                                                                                   |
| :-------------------------------------------- | :----------- | :---------------------------------------------------------------------------------------------- |
| `apps/api/src/index.ts`                       | **REFACTOR** | Introduce logger interface initialization. Integrate shared environment variables.              |
| `apps/api/src/env.ts`                         | **REWRITE**  | Replace custom script logic with robust parsed definitions from `@community-os/config`.         |
| `apps/api/src/lib/db.ts`                      | **REFACTOR** | Replace basic console calls with the abstracted `@community-os/utils` logger.                   |
| `apps/api/src/lib/redis.ts`                   | **REFACTOR** | Replace basic console calls with the abstracted `@community-os/utils` logger.                   |
| `apps/api/src/lib/cloudinary.ts`              | **REFACTOR** | Use typed config variables instead of reading `process.env` directly.                           |
| `apps/api/src/controllers/issueController.ts` | **REFACTOR** | Change inline console messages to Winston logger adapter calls. Integrate shared types.         |
| `apps/api/src/controllers/voteController.ts`  | **REFACTOR** | Change inline console messages to Winston logger adapter calls. Integrate shared types.         |
| `apps/api/src/controllers/userController.ts`  | **REFACTOR** | Change inline console messages to Winston logger adapter calls. Integrate shared types.         |
| `apps/api/src/jobs/queue.ts`                  | **REFACTOR** | Incorporate shared env and prepare structure for background worker decoupling in `apps/worker`. |
| `apps/api/src/jobs/aiWorker.ts`               | **REFACTOR** | Incorporate shared env, shared logger, and populate client metrics cleanly.                     |
| `apps/web/app/page.tsx`                       | **REFACTOR** | Rebrand naming from "Community Hero" to "CommunityOS". Use shared design color CSS variables.   |
| `apps/web/app/layout.tsx`                     | **REFACTOR** | Rebrand page title, keywords, descriptions, and SEO meta tags.                                  |
| `apps/web/lib/api.ts`                         | **REFACTOR** | Integrate shared configuration env checks.                                                      |
| `apps/web/lib/socket.ts`                      | **REFACTOR** | Integrate shared configuration env checks.                                                      |
| `apps/web/hooks/useGeolocation.ts`            | **KEEP**     | No structural modifications needed in this sprint (verified).                                   |
| `apps/web/hooks/useSocket.ts`                 | **KEEP**     | No structural modifications needed in this sprint (verified).                                   |
