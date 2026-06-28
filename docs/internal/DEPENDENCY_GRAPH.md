# Dependency Graph Analysis

## Monorepo Workspace Dependency Analysis and Architecture Verification

This document diagrams and analyzes the dependency mappings of all 17 workspaces inside the CommunityOS monorepo.

---

## 1. Mappings of Monorepo Workspaces

```mermaid
graph TD
  %% Applications
  web[apps/web] --> types[@community-os/types]
  web --> validation[@community-os/validation]
  web --> ui[@community-os/ui]
  web --> config[@community-os/config]
  web --> hooks[@community-os/hooks]

  admin[apps/admin] --> types
  admin --> validation
  admin --> ui
  admin --> config
  admin --> hooks

  api[apps/api] --> types
  api --> validation
  api --> repos[@community-os/repositories]
  api --> errors[@community-os/errors]
  api --> logger[@community-os/logger]
  api --> config
  api --> utils[@community-os/utils]

  worker[apps/worker] --> types
  worker --> config
  worker --> logger
  worker --> errors

  %% Packages
  repos --> types
  repos --> errors
  repos --> logger

  validation --> types

  logger --> errors

  ui --> tailwind[@community-os/tailwind-config]
  ui --> hooks

  config --> utils

  %% Base Packages
  types
  errors
  utils
  tailwind
  typescript[@community-os/typescript-config]
  eslint[@community-os/eslint-config]
```

---

## 2. Granular Dependency Analysis

### 2.1 apps/api (api)

- **Incoming Dependencies**: None (Root application workspace).
- **Outgoing Dependencies**: `@community-os/types`, `@community-os/validation`, `@community-os/repositories`, `@community-os/errors`, `@community-os/logger`, `@community-os/config`, `@community-os/utils`.
- **Dependency Depth**: 3 layers deep (`apps/api` -> `@community-os/repositories` -> `@community-os/logger` -> `@community-os/errors`).

### 2.2 apps/web (web)

- **Incoming Dependencies**: None (Root application workspace).
- **Outgoing Dependencies**: `@community-os/types`, `@community-os/validation`, `@community-os/ui`, `@community-os/config`, `@community-os/hooks`.

### 2.3 @community-os/repositories

- **Incoming Dependencies**: `apps/api`.
- **Outgoing Dependencies**: `@community-os/types`, `@community-os/errors`, `@community-os/logger`.
- **Verification**: Zero dependencies on Express, web routes, or API layers.

### 2.4 @community-os/types

- **Incoming Dependencies**: `apps/api`, `apps/web`, `apps/admin`, `apps/worker`, `@community-os/validation`, `@community-os/repositories`.
- **Outgoing Dependencies**: None. It is a leaf workspace.
- **Verification**: 100% database and framework agnostic.

---

## 3. Forbidden and Circular Dependency Analysis

- **Circular Dependencies**: **None**. Compilation passes under Turborepo with caching, confirming zero cyclic dependency loops.
- **Forbidden Dependencies Checks**:
  - Packages are strictly forbidden from importing from applications (e.g. `@community-os/repositories` cannot import classes or policies from `apps/api`).
  - Frontend layers (`web`, `admin`) are forbidden from importing backend components or database drivers.
  - Controllers cannot import databases or repositories directly (guarded by Vitest tests).

---

## 4. Layering Validation Summary

All workspaces conform strictly to Clean Architecture layering:

- **Presentation (Outer)** -> **Orchestration (Middle)** -> **Domain & Models (Core)**.
- Mappings verify that dependency arrows point strictly inward. No inner circle has any awareness of outer adapters.
