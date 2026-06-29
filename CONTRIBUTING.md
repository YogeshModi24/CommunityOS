# Contributing to CommunityOS

Thank you for contributing to CommunityOS! To maintain high code quality and consistency across our monorepo, we enforce strict development standards.

---

## 1. Quality Gates & Pre-Commit Hooks

We use **Husky** and **lint-staged** to run automated formatting and lint checks on every commit.

If you attempt to commit code that fails formatting or linting, the commit will be blocked. To fix formatting automatically before committing, run:

```bash
npm run format
```

---

## 2. Commit Message Convention

We enforce the **Conventional Commits** standard using Commitlint. Every commit message must follow this structure:

```
<type>(<scope>): <description>
```

### Approved Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Example

`feat(dx): configure import sorting and husky hooks`

---

## 3. Pull Request Guidelines

Before submitting a Pull Request, ensure that you run the verification suite locally:

```bash
npm run verify
```

This performs a full formatting check, linting check, TypeScript compilation check, and builds all workspaces. All checks must pass with zero errors.

---

## 4. Branching Strategy & Repository Freeze

CommunityOS v1.0.1+ is in **Maintenance Mode**. To preserve the stability of the production codebase while allowing for future experimentation, we follow this strict branching model:

### `main`

- **Purpose:** Stable production-ready code.
- **Allowed:** Critical bug fixes, security patches, documentation updates, and release tags.
- **Not Allowed:** Experimental features, large refactors, schema/architecture redesigns.
- **Protection:** Requires a Pull Request, passing CI checks (build, typecheck, lint), and code review. **Never commit directly to `main`.**

### `v1.0.x`

- **Purpose:** Maintenance branch for the current production release.
- **Allowed:** Hotfixes, production bugs, performance and accessibility improvements.
- **Not Allowed:** New functionality or APIs.

### `future`

- **Purpose:** Research and experimentation (e.g., ML predictive analytics, mobile app integrations).
- **Rules:** Breaking changes are acceptable here. Nothing from `future` merges into `main` until thoroughly tested and deliberately promoted as a major release.

## 5. Maintenance Policy

As a flagship portfolio project, our success criteria dictates:

- **Prioritize stability** over new features.
- Fix real bugs before adding functionality.
- Maintain a clean Git history using Conventional Commits.
