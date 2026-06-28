# Migration Backlog: CommunityOS Sprint 0.1

- **Version**: 1.0.0
- **Status**: Draft
- **Owner**: Lead Staff Engineer & CTO

This document tracks every system relocation, database config switch, and utility abstraction during the restructuring.

| Migration ID | Current State                                   | Target State                                | Migration Strategy                                                        | Risk                                          | Verification                                      | Rollback                               | Owner          | Status |
| :----------- | :---------------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------ | :-------------------------------------------- | :------------------------------------------------ | :------------------------------------- | :------------- | :----- |
| **MIG-001**  | `apps/api` at root scope                        | `apps/api` workspace inside monorepo        | Relocate folder, update relative workspace references                     | Broken imports, server boot failure           | Run `npm run build` inside workspace              | Revert from backup directory           | CTO / Lead Eng | To Do  |
| **MIG-002**  | `apps/web` at root scope                        | `apps/web` workspace inside monorepo        | Relocate folder, configure next config & compiler aliases                 | Visual assets missing, router resolution bugs | Run next build in monorepo context                | Revert from backup directory           | CTO / Lead Eng | To Do  |
| **MIG-003**  | Local `env.ts` validations in both api/web      | Central validation in `packages/config`     | Extract schemas into zod wrapper package, export typed variables          | Boot failure due to missing default vars      | Execute dry-run compile on both workspaces        | Revert to local validation             | CTO / Lead Eng | To Do  |
| **MIG-004**  | Standard inline console logs in api controllers | Abstracted Winston `ILogger` calls          | Replace `console.log` with shared utils logger import                     | Intercepted streams or silent logs            | Verify stdout stream output during dev            | Revert code changes to Mongoose routes | CTO / Lead Eng | To Do  |
| **MIG-005**  | Standalone UI styles & theme colors in web app  | Expose Tailwind Variables via `packages/ui` | Declare variables in shared config tailwind plugin, include theme globals | Class clash, layout break                     | Launch dev server and inspect components visually | Revert tailwind-config adjustments     | CTO / Lead Eng | To Do  |
