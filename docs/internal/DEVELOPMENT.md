# Development Guide

This guide details the internal developer configuration, workspace conventions, and architectural boundaries of the **CommunityOS** monorepo.

---

## 1. Local Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Servers**:
   ```bash
   npm run dev
   ```

---

## 2. Shared Workspace Conventions

All packages inside `packages/` must expose a single public entry point at `src/index.ts`.

- Deep imports (e.g., importing directly from `packages/utils/src/internalFile.ts` in other packages/apps) are forbidden.
- Workspace dependencies are exposed via the `exports` configuration block in each package's `package.json`.

---

## 3. Dependency Boundaries (Architecture Rules)

We enforce strict separation of concerns across our applications:

- **`apps/web`**, **`apps/api`**, and **`apps/worker`** must never directly depend on or import files from each other.
- Shared logic (types, utilities, databases) must be abstracted into decoupled packages inside `packages/`.
- This boundary is enforced via the `no-restricted-imports` rules inside `packages/eslint-config/next.js` and `packages/eslint-config/node.js`.
