# Backend Architecture

The CommunityOS backend is an **Express.js** REST API designed around Domain-Driven Design (DDD) principles.

## Core Technologies
- **Framework:** Node.js + Express
- **Language:** TypeScript
- **Real-time:** Socket.io
- **Validation:** Zod

## Directory Structure
- `src/controllers`: Request/Response handling.
- `src/services`: Business logic and orchestration.
- `src/repositories`: Database access abstraction.
- `src/middleware`: Auth, validation, and error handling.
