# Migration Plan: CommunityHero to CommunityOS Monorepo Restructuring

- **Version**: 1.0.1
- **Owner**: Lead Staff Engineer & CTO
- **Review Date**: June 25, 2026

This migration plan outlines the safe, incremental restructuring of the **CommunityHero** prototype into the enterprise-grade **CommunityOS** monorepo layout.

---

## 1. Safety & Rollback Strategy (Git-Based)

In compliance with the updated governance directives, **folder-based duplication of application roots (e.g. `api-new` or `web-new`) is prohibited**. Instead, codebase protection and rollbacks will rely on a robust Git-based workflow:

1. **Feature Branch Isolation**: All migration work is executed on a dedicated feature branch: `migration/sprint-0.1-foundations`.
2. **Annotated Rollback Tags**: Before starting TSK-001, we tag the current master head: `git tag -a v0.0.0-prototype -m "Pre-migration frozen prototype baseline"`.
3. **Granular Commits**: Changes will be committed incrementally after validation of each individual task (TSK-001 through TSK-010). Each commit must compile successfully.
4. **Revert Strategy**: In the event of a blocking compile or execution failure that cannot be resolved quickly, we revert the specific task commit or reset to the tag:
   ```bash
   git reset --hard v0.0.0-prototype
   git clean -fd
   ```

---

## 2. Migration Phases & Transition Rules

### Phase 1: Monorepo Scaffolding

- Update root `package.json` to configure workspaces (`apps/*` and `packages/*`).
- Scaffold packages under `packages/` including README, CHANGELOG, and index config files.

### Phase 2: Application Relocation

- Move `apps/api` and `apps/web` into their respective workspace directories.
- Refactor internal build configs and path aliases. Do not alter dependencies or run major runtime migrations.

### Phase 3: Shared Libraries Integration

- Bind central TypeScript configurations, central ESLint, tailwind tokens, custom logging, and environment managers.
- Confirm imports resolve cleanly.

### Phase 4: Final Validation

- Run integration check and compile checks. Output `ARCHITECTURE_REPORT.md` and complete sprint.

---

## 3. Measurable Migration Success Metrics

The migration is successful only if the following metrics return a positive result:

1. **Build Success**: Root-level command `npm run build` completes successfully.
2. **Lint & Typecheck Compliance**: Commands `npm run lint` and type-checking on all workspaces return zero errors.
3. **Authentication Verification**: Users can successfully log in using NextAuth credentials via `apps/web`.
4. **Issue Reporting Integrity**: Users can submit issue reports through the client form, uploading images successfully to Cloudinary.
5. **AI Analysis Fallbacks**: Issues queue jobs on BullMQ/Redis and trigger AI analysis flows (or fallbacks) with real-time socket updates.
6. **WebSockets Eventing**: UI components receive `issue:new` and `issue:voted` notifications.
7. **Zero Visible Regressions**: Map visual elements, leaderboard lists, and styling layouts remain identical from the citizen's perspective.

---

## 4. Risks & Mitigations

| Risk ID                              | Risk Vector                          | Mitigation Strategy                                            |
| :----------------------------------- | :----------------------------------- | :------------------------------------------------------------- |
| **Broken Absolute Import Resolvers** | Path alignment issues                | centralize configurations inside `packages/typescript-config`. |
| **Socket Connection Disruption**     | Websocket endpoint mismatch          | Retain ports (`5001` backend, `3000` frontend).                |
| **Dependency Version Clashes**       | Monorepo root node_modules collision | Lock framework versions (Next.js 14, React 18, Tailwind 3).    |

---

## 5. Engineering Governance Rules

The following immutable guidelines govern all work on this sprint:

1. **No Duplicated Application Folders**: Do not duplicate application folders (e.g. `api-new`). Use Git branches, commits, and tags for rollback instead of filesystem duplication.
2. **Preserve Current Database Runtime**: Do not migrate from MongoDB to PostgreSQL yet. The `packages/database` package may be scaffolded, but Prisma client integration and data migration belong to the dedicated database sprint.
3. **Docker Multi-service Configuration**: Local Docker configurations must support the current database runtime dependencies (MongoDB) alongside future services (PostgreSQL, Redis).
4. **Validation-Guided Task Transitions**: Tasks must be implemented incrementally. Validate, commit, and only then proceed to the next task. No massive multi-target changes.
5. **Git-Based Rollback Rules**: Maintain recovery points using tags and commit hashes.
6. **Architecture Gates**: Work must follow these sequential checks:
   ```
   [Planning] -> [Architecture Review] -> [Implementation] -> [Validation] -> [Code Review] -> [Merge Approval]
   ```
7. **End-of-Sprint Deliverables**: Every sprint must produce:
   - `SPRINT_COMPLETION_REPORT.md`
   - `TECH_DEBT_REGISTER.md`
   - `ARCHITECTURE_COMPLIANCE_REPORT.md`
8. **Definition of Done (DoD)**: An implementation task is done only if:
   - Functionality is fully preserved.
   - Build, lint, typecheck, and test suites pass.
   - Documentation is updated.
   - Compliance to Blueprint v1.0 and zero security/performance regressions are verified.
9. **Incremental Refactoring**: Avoid large-scale rewrites unless explicitly justified in the Refactor Matrix.
10. **Blueprint & ADR Gating**: If implementation details conflict with Blueprint v1.0, an approved ADR, or the Engineering Standards, stop immediately, explain the conflict, propose alternatives, and wait for approval.
