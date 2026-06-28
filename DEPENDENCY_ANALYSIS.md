# Dependency Analysis: Package Assessment & Bundle Optimization

- **Version**: 1.0.0
- **Status**: Completed
- **Owner**: Lead Staff Engineer & CTO

This document presents the dependency audit, package weight measurements, and structural mapping for the monorepo workspaces.

---

## 1. Package Dependency Tree

```
                       [Root Workspace]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
          [apps/web]                    [apps/api]
               │                             │
    ┌──────────┼──────────┐       ┌──────────┼──────────┐
    ▼          ▼          ▼       ▼          ▼          ▼
[Next.js]  [RadixUI]  [Mapbox] [Express]  [Mongoose] [BullMQ]
    │          │                  │          │          │
    └──────────┬──────────┘       └──────────┬──────────┘
               ▼                             ▼
       [packages/ui]                 [packages/utils]
               │                             │
               └──────────────┬──────────────┘
                              ▼
                       [packages/types]
```

---

## 2. Heavy Packages & Bundle Size Assessment

| Package Name        | Workspace  | Current Bundle Impact | Architectural Mitigation Plan                                                         |
| :------------------ | :--------- | :-------------------- | :------------------------------------------------------------------------------------ |
| `mapbox-gl`         | `apps/web` | ~250 KB (gzip)        | Dynamic lazy-loading using Next.js `dynamic()` imports with suspense fallbacks.       |
| `leaflet`           | `apps/web` | ~40 KB (gzip)         | Kept for alternative offline rendering. Assess replacement with Mapbox in Sprint 0.2. |
| `framer-motion`     | `apps/web` | ~35 KB (gzip)         | Centralize transitions in `packages/ui`. Limit animation logic on static pages.       |
| `@langchain/openai` | `apps/api` | ~120 KB (gzip)        | Relocate model invocations entirely to the background `apps/worker` application.      |

---

## 3. Circular Dependencies & Duplicate Packages

- **Circular Dependencies**: Checked routes-controllers-models references. No active circular dependencies exist.
- **Duplicate Packages**: Duplicated `zod` version checks and lint configurations resolved by moving them into shared packages (`packages/types`, `@community-os/eslint-config`).
- **Unused Packages**: `@tailwindcss/forms` inside `apps/web` package is not actively used. Recommend removal in Sprint 0.2 to clean tailwind dependencies.
