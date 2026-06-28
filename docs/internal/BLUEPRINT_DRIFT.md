# Blueprint Drift: Compliance Analysis

- **Blueprint Version**: 1.0.0
- **Scope**: Sprint 0.1 Planning State
- **Auditor**: independent CommunityOS Architecture Review Board

This register logs deviations between the approved Blueprint v1.0 and the current codebase layout.

---

## 1. Drift Analysis

### DRIFT-001: Next.js & React Framework Versions

- **Blueprint Requirement**: Next.js 15 (App Router), React 19.
- **Current Implementation**: Next.js 14.2.5, React 18.3.0.
- **Difference**: The current codebase runs on React 18.3.0 and Next.js 14.
- **Reason**: Sprint 0.1 focus is restricted to folder restructuring, monorepo configuration, and quality gating. Upgrading React and Next.js libraries simultaneously increases regression risks.
- **Risk**: Low. Temporary version gap ensures high runtime stability.
- **Recommendation**: Lock framework versions at React 18 and Next.js 14 for Sprint 0.1. Plan the React 19 / Next.js 15 upgrade for a dedicated future sprint.
- **Decision**: **APPROVED WITH CONDITIONS** (No ADR required; version freeze is accepted for the duration of Sprint 0.1).

---

### DRIFT-002: Database Engine

- **Blueprint Requirement**: PostgreSQL with Prisma ORM.
- **Current Implementation**: MongoDB with Mongoose.
- **Difference**: The current backend depends on MongoDB.
- **Reason**: Database migration requires implementing repository patterns and porting schema configurations, which is out-of-scope for the monorepo restructuring phase (Sprint 0.1).
- **Risk**: High if not addressed, but low for Sprint 0.1.
- **Recommendation**: Maintain MongoDB for Sprint 0.1. Scaffold the database package (`packages/database`), and execute the database migration in Sprint 0.2.
- **Decision**: **APPROVED WITH CONDITIONS** (Requires a dedicated Database Migration ADR in Sprint 0.2).
