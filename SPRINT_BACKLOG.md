# Sprint Backlog: CommunityOS Sprint 0.1

- **Version**: 1.0.0
- **Status**: Draft
- **Owner**: Lead Staff Engineer & CTO

This document breaks Sprint 0.1 (Engineering Foundations) into individual, trackable engineering tasks.

---

### TSK-001: Root Workspace Restructuring & Scaffolding

- **Priority**: Critical
- **Estimate**: 3 hours
- **Dependencies**: None
- **Files Affected**:
  - `package.json` (modified)
  - `turbo.json` (modified)
  - `apps/web/` (relocated)
  - `apps/api/` (relocated)
  - `apps/admin/` (new scaffold)
  - `apps/worker/` (new scaffold)
  - `packages/` (new directory)
  - `configs/` (new directory)
  - `scripts/` (new directory)
- **Risks**:
  - Restructuring the directory might break paths or locks in running terminal processes (`npm run dev`).
- **Acceptance Criteria**:
  - Workspaces `apps/*` and `packages/*` are recognized by npm.
  - Existing packages compile in their relocated paths.
- **Rollback Strategy**:
  - Restore files from `.legacy-backup` and revert `package.json` changes.
- **Status**: To Do

---

### TSK-002: Shared TypeScript Configurations (`packages/typescript-config`)

- **Priority**: High
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/typescript-config/package.json` (new)
  - `packages/typescript-config/base.json` (new)
  - `packages/typescript-config/nextjs.json` (new)
  - `packages/typescript-config/node.json` (new)
  - `apps/api/tsconfig.json` (modified to inherit)
  - `apps/web/tsconfig.json` (modified to inherit)
- **Risks**:
  - Missing type definitions or path aliases after inheritance.
- **Acceptance Criteria**:
  - Apps compile successfully using `tsc --noEmit` inheriting the centralized configs.
- **Rollback Strategy**:
  - Revert modifications to app-level `tsconfig.json` files.
- **Status**: To Do

---

### TSK-003: Shared ESLint Configurations (`packages/eslint-config`)

- **Priority**: High
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/eslint-config/package.json` (new)
  - `packages/eslint-config/next.js` (new)
  - `packages/eslint-config/node.js` (new)
  - `apps/api/.eslintrc.json` (modified)
  - `apps/web/.eslintrc.json` (modified)
- **Risks**:
  - Conflicting rules causing linting failures across the monorepo.
- **Acceptance Criteria**:
  - Running lint script from root checks all files using shared rules.
- **Rollback Strategy**:
  - Revert modification to app-level `.eslintrc.json` files.
- **Status**: To Do

---

### TSK-004: CSS Variable Design Tokens & UI Scaffold (`packages/ui` & `packages/tailwind-config`)

- **Priority**: High
- **Estimate**: 4 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/tailwind-config/package.json` (new)
  - `packages/tailwind-config/index.js` (new)
  - `packages/ui/package.json` (new)
  - `packages/ui/src/globals.css` (new, declares CSS variable tokens)
  - `apps/web/tailwind.config.js` (modified to extend shared config)
- **Risks**:
  - UI visual layout degradation if Tailwind overrides class patterns unexpectedly.
- **Acceptance Criteria**:
  - All landing page color references rely on the central HSL CSS variables system (no hardcoded hexadecimal colors).
- **Rollback Strategy**:
  - Restore the original static styles in `apps/web/app/globals.css`.
- **Status**: To Do

---

### TSK-005: Logger Interface and Winston / Console Adapters (`packages/utils`)

- **Priority**: High
- **Estimate**: 3 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/utils/package.json` (new)
  - `packages/utils/src/logger/ILogger.ts` (new, declares interface)
  - `packages/utils/src/logger/ConsoleLogger.ts` (new)
  - `packages/utils/src/logger/WinstonLogger.ts` (new)
  - `apps/api/src/` (refactored to import Logger from `@community-os/utils`)
- **Risks**:
  - Incomplete refactoring of logging leading to runtime issues where standard streams are intercepted.
- **Acceptance Criteria**:
  - `console.log` and `console.error` calls are completely removed from backend API controllers and routes, replaced by the logger client.
- **Rollback Strategy**:
  - Revert API files utilizing the logger.
- **Status**: To Do

---

### TSK-006: Zod Environment Validation Package (`packages/config`)

- **Priority**: High
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/config/package.json` (new)
  - `packages/config/src/env.ts` (new, validates both client/server environment schemas)
  - `apps/api/src/env.ts` (modified to import from `@community-os/config`)
- **Risks**:
  - Validation failures blocking server initialization on staging environments.
- **Acceptance Criteria**:
  - Invalid environment configurations immediately throw descriptive zod errors on boot, stopping the process.
- **Rollback Strategy**:
  - Restore local `env.ts` files inside application folders.
- **Status**: To Do

---

### TSK-007: Centralized TypeScript Schemas (`packages/types`)

- **Priority**: Medium
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `packages/types/package.json` (new)
  - `packages/types/src/index.ts` (new, exports issue and user interfaces)
- **Risks**:
  - Synchronization issues between Mongoose models and validation schemes.
- **Acceptance Criteria**:
  - Types are shared and resolved cleanly without compiler complaints in both backend and frontend workspaces.
- **Rollback Strategy**:
  - Revert client-level type imports.
- **Status**: To Do

---

### TSK-008: Docker Setup & Local Containers

- **Priority**: Medium
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `docker-compose.yml` (new)
  - `apps/web/Dockerfile` (new)
  - `apps/api/Dockerfile` (new)
- **Risks**:
  - Inefficient cache caching in docker builds, slow image compiles.
- **Acceptance Criteria**:
  - Running `docker compose up -d` successfully provisions PostgreSQL and Redis instances locally.
- **Rollback Strategy**:
  - Remove docker containers and generated volumes.
- **Status**: To Do

---

### TSK-009: GitHub Actions CI Workflows

- **Priority**: Medium
- **Estimate**: 2 hours
- **Dependencies**: TSK-001
- **Files Affected**:
  - `.github/workflows/ci.yml` (new)
- **Risks**:
  - CI pipeline timeout or caching conflicts on node_modules.
- **Acceptance Criteria**:
  - Code pushes to `main` trigger linting, type-checking, and build checks.
- **Rollback Strategy**:
  - Delete `.github/workflows/ci.yml`.
- **Status**: To Do

---

### TSK-010: Getting Started & Developer Documentation

- **Priority**: High
- **Estimate**: 2 hours
- **Dependencies**: None
- **Files Affected**:
  - `README.md` (modified)
  - `DEVELOPMENT.md` (new)
- **Risks**:
  - Outdated setup steps leading to onboarding friction.
- **Acceptance Criteria**:
  - Clear runbooks detailing bootstrap instructions.
- **Rollback Strategy**:
  - Revert `README.md`.
- **Status**: To Do
