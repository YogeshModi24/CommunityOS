# CommunityOS

Welcome to **CommunityOS** (formerly CommunityHero), the enterprise-grade monorepo platform designed to scale municipal services, smart city systems, and citizen engagement.

This repository is structured as an npm workspaces monorepo managed with Turborepo for optimized build orchestration, type checking, and linting.

---

## 1. Directory Structure

```
├── apps/
│   ├── web/               # Next.js 14 web client
│   ├── api/               # Express backend
│   ├── admin/             # Next.js admin placeholder
│   └── worker/            # Background BullMQ/Redis worker
├── packages/
│   ├── typescript-config/ # Centralizedstrict TypeScript configurations
│   ├── eslint-config/     # Centralized ESLint configurations & boundary rules
│   ├── tailwind-config/   # Shared design token configs
│   ├── ui/                # Shared Tailwind variables & css theme
│   ├── database/          # Shared Prisma database setup
│   ├── types/             # Shared TypeScript types & Zod schemas
│   ├── config/            # Shared configuration manager
│   ├── utils/             # Shared utilities (logging, helpers)
│   └── hooks/             # Shared React hooks
```

---

## 2. Developer Commands

All standard operations are triggered from the repository root:

- **Launch Local Stack**: `npm run dev`
- **Build All Workspaces**: `npm run build`
- **Lint Codebase**: `npm run lint`
- **Format Codebase**: `npm run format`
- **Typecheck Codebase**: `npm run typecheck`
- **Check All Gated Standards (Format, Lint, Typecheck, Build)**: `npm run check`
- **Verify Readiness**: `npm run verify`
- **Clean Build Artifacts**: `npm run clean`

---

## 3. Developer Documentation

- For contribution workflows, see [CONTRIBUTING.md](./CONTRIBUTING.md).
- For local environment setup and configuration, see [DEVELOPMENT.md](./DEVELOPMENT.md).
