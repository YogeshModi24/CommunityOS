# Risk Review: Threat & Vulnerability Registry

- **Blueprint Version**: 1.0.0
- **Auditor**: independent CommunityOS Architecture Review Board

This document assesses structural, deployment, and operational risk vectors.

---

## 1. Risk Matrix

### RSK-DB-001: Geolocation Index Compatibility

- **Category**: Database
- **Description**: MongoDB's `$near` geolocation spatial logic is hardcoded inside controllers. PostgreSQL relies on bounding box filtering or PostGIS extensions.
- **Probability**: High
- **Impact**: High
- **Severity**: High
- **Mitigation**: Implement a clean repository abstraction layer during Sprint 0.2 to isolate geolocation mapping, allowing PostgreSQL migrations to proceed without breaking controllers.
- **Owner**: Tech Lead
- **Target Sprint**: Sprint 0.2

---

### RSK-DEP-002: Monorepo Root Compilation Collisions

- **Category**: Dependencies
- **Description**: Shared workspace modules collide with root `node_modules` configurations, breaking TypeScript compilation.
- **Probability**: Medium
- **Impact**: Medium
- **Severity**: Medium
- **Mitigation**: Centralize config mappings in `@community-os/typescript-config`, and force strict compiler checks across all subprojects.
- **Owner**: DevOps Engineer
- **Target Sprint**: Sprint 0.1

---

### RSK-SEC-003: Unvalidated Input Exploits

- **Category**: Security
- **Description**: Public endpoints accept request payloads without schema validation checks, allowing database injection attempts.
- **Probability**: Medium
- **Impact**: High
- **Severity**: High
- **Mitigation**: Move input schemas to a centralized package (`packages/types`) and validate payloads via custom Express middleware using Zod.
- **Owner**: Security Architect
- **Target Sprint**: Sprint 0.1
