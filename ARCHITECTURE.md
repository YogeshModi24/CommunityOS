# CommunityOS Architecture Guide

CommunityOS is designed as a scalable, event-driven platform utilizing a strict Turborepo monorepo structure. This document outlines the architectural decisions and data flow.

## 1. System Overview & Monorepo Layout

The repository is managed using **Turborepo** to ensure lightning-fast builds and strict dependency boundaries.

- `apps/web`: The Next.js 14 (App Router) frontend, containing the citizen and municipality dashboards, maps, and real-time UI.
- `apps/api`: The Express.js backend that handles REST requests, authentication, and Socket.IO connections.
- `apps/worker`: A headless Node.js service running BullMQ, responsible for offloading heavy AI processes.
- `packages/*`: Shared modules for Types, Database (Prisma), Events, Validation (Zod), and Configurations.

## 2. Event-Driven Architecture (EventBus)

We explicitly rejected tightly coupled controllers. Instead, all domains communicate via `packages/events`.
When an issue is reported, the API doesn't directly update the dashboard. It emits an `issue.created.v1` event.

- **Benefit:** Modularity. The gamification service, the notification service, and the real-time Socket.IO emitter all listen to this event independently without bloating the initial request controller.

## 3. Real-Time Socket.IO Flow

The `apps/api` service maintains a Socket.IO server.

- **Broadcasts:** It subscribes to the EventBus. When an event fires, the socket server broadcasts the payload to authenticated clients.
- **Client Handling:** The Next.js frontend uses a custom `useSocket` hook with React state batching and `useMemo` to prevent map re-render jitter. It includes a 5-second graceful degradation timeout for auto-resyncing upon network drops.

## 4. AI & Background Processing Pipeline

OpenAI Vision API calls can take 5-15 seconds and have strict rate limits.

- **BullMQ:** The `apps/api` delegates the image processing task to Redis via BullMQ.
- **Worker:** The `apps/worker` consumes the job, calls the OpenAI API, determines the category and severity, and then emits an `issue.updated.v1` event via the EventBus. It utilizes exponential backoff for `HTTP 429` (Rate Limit) errors.
- **LangChain:** For municipal admins, a conversational Copilot is embedded in the frontend. It uses LangChain's Tool Calling to execute secure, read-only queries against the database to calculate real-time SLA metrics.

## 5. Security & Authentication

- **JWT via NextAuth:** The frontend authenticates via NextAuth.
- **Stateless API:** The Express API enforces stateless JWT verification middleware on all protected routes.
- **RBAC:** The schema includes Role-Based Access Control (`citizen`, `municipality`, `admin`).
- **Secure File Storage:** Images are uploaded directly to Cloudinary using secure signed URLs, preventing our servers from handling large binary payloads.

## 6. Deployment Architecture

- **Frontend:** Vercel (Edge Network).
- **Backend & Worker:** Render (Dockerized Node environments).
- **Database:** MongoDB Atlas (Serverless).
- **Cache/Queue:** Redis Cloud.
