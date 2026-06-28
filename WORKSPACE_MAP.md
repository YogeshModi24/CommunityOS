# Workspace Map

## Monorepo Directory Layout and Structural Responsibilities

This document maps all directories in the CommunityOS root workspace and outlines their owners and roles.

---

## 1. Directory Structural Map

```text
/ (Root Workspace)
├── apps/                        # Application targets
│   ├── api/                     # Node.js backend server API
│   ├── worker/                  # BullMQ worker job consumers
│   ├── web/                     # Citizen-facing App App (Next.js)
│   └── admin/                   # Moderator Backoffice App (Next.js)
│
├── packages/                    # Shareable libraries and configs
│   ├── config/                  # Variable loaders & validation (Zod)
│   ├── database/                # Global connection definitions
│   ├── errors/                  # Custom exceptions definitions
│   ├── eslint-config/           # Shared linter parameters
│   ├── hooks/                   # Shareable React hooks
│   ├── logger/                  # Context logging provider (Winston)
│   ├── repositories/            # Database abstractions & models
│   ├── tailwind-config/         # Brand styles definitions
│   ├── types/                   # Pure models and DTO files
│   ├── typescript-config/       # Shared compiler rules
│   ├── ui/                      # Global theme component files
│   ├── utils/                   # Result monads & functional code
│   └── validation/              # Common Zod validations schemas
│
├── configs/                     # Application config files (.json)
├── scripts/                     # Seed scripts, setups, DX tools
├── blueprint/                   # CommunityOS architectural master design
├── docs/                        # Architecture deliverables
└── (Root Files)                 # ADR files, compliance reviews, registers
```

---

## 2. Responsibilities and Ownership

### 2.1 Applications (`apps/`)

- **api** (Owner: Backend Team): Coordinates Use Cases, hosts controllers, triggers socket.io feeds, and runs Express servers.
- **worker** (Owner: Backend / Infrastructure): Leverages BullMQ queues to perform async background operations (e.g. AI image analysis).
- **web** (Owner: Frontend Team): Public Next.js portal where citizens view maps, report issues, and vote.
- **admin** (Owner: Backoffice Operations): Internal Moderator Dashboard built to review flag trends and resolve issues.

### 2.2 Shared Packages (`packages/`)

- **config, database, errors, logger, utils**: Maintained by the **Infrastructure Core Team**. They form the core layer providing variables, logs, correlation tracing, and error templates.
- **types, validation, repositories**: Maintained by the **Backend & Database Teams**. They define domain entities, validate inputs, and encapsulate Mongoose models.
- **ui, hooks, tailwind-config**: Maintained by the **UX & Frontend Teams**. They ensure color themes and typography are consistent across apps.

### 2.3 Documentation, Scripts, and Specifications

- **blueprint/**: Shared design specs from the Architecture Review Board.
- **scripts/**: Developer setups, database seeds, and workspace tooling.
- **ADRs (Root Markdown files)**: Record formal architecture decisions (e.g. `ADR-0017-service-ports.md`).
