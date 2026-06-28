# Architecture Debt Register: Systemic Structural Issues

- **Blueprint Version**: 1.0.0
- **Scope**: Current Pre-Migration State
- **Auditor**: independent CommunityOS Architecture Review Board

This register logs structural debt, highlighting risks, estimates, and remediation schedules.

---

## 1. Structural Debt Registry

### ARB-DB-001: Mongoose Schema Coupling

- **Description**: Express controllers import and execute queries directly on Mongoose models.
- **Impact**: Completely blocks database migration. Switching to PostgreSQL/Prisma requires refactoring all API route handlers.
- **Risk**: High. Introduces potential regressions in data formatting.
- **Priority**: Critical.
- **Owner**: Tech Lead
- **Suggested Sprint**: Sprint 0.2 (Database Sprint)
- **Estimated Cost**: 12 engineering hours.
- **Recommendation**: Design abstract repository interfaces for database access, decoupling Express controllers from specific database engines.

---

### ARB-ENV-002: Hardcoded Mock Flags

- **Description**: Queue workers and AI engines determine mockup execution modes using checks like `REDIS_URL === 'mock'`.
- **Impact**: Spreads configuration checking logic throughout business logic and worker jobs.
- **Risk**: Low. Harder to configure staging systems.
- **Priority**: Medium.
- **Owner**: Tech Lead
- **Suggested Sprint**: Sprint 0.1
- **Estimated Cost**: 2 engineering hours.
- **Recommendation**: Move config validation to a centralized `packages/config` package, resolving flags as structured variables during server boot.

---

### ARB-TST-003: Lack of Testing Harnesses

- **Description**: The project has zero test files, testing configurations, or automated verification suites.
- **Impact**: Developers must manually check authentication, issue reporting, and maps visually, which is error-prone.
- **Risk**: High. Potential regressions may bypass deployment gates.
- **Priority**: High.
- **Owner**: QA / Tech Lead
- **Suggested Sprint**: Sprint 0.1 / 0.2
- **Estimated Cost**: 8 engineering hours.
- **Recommendation**: Configure Vitest and Playwright in the monorepo root. Add continuous build checks in GitHub Actions.

---

### ARB-LOG-004: Direct Console Stream Outputs

- **Description**: Controllers call unstructured `console.log` and `console.error` directly.
- **Impact**: Prevents log level filtering (e.g. info vs. debug) and standard log parsing.
- **Risk**: Low.
- **Priority**: High.
- **Owner**: Lead Engineer
- **Suggested Sprint**: Sprint 0.1
- **Estimated Cost**: 3 engineering hours.
- **Recommendation**: Implement `ILogger` interface wrapper in `packages/utils`, replacing stdout calls with Winston adapters.
