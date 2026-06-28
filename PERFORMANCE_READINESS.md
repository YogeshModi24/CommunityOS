# Performance Readiness

## Monorepo Performance Profiles and Optimization Audit

This audit evaluates monorepo build performance, asset sizes, and runtime performance profiles.

---

## 1. Build and Compilation Profiles

Monorepo task execution leverages Turborepo caching to minimize build overhead:

- **Root Verification Pipeline (`npm run verify`)**: Compiles and builds all 17 workspaces in **8.7 seconds** from a clean slate.
- **Incremental Builds**: Subsequent verify calls complete in **< 1.0 second** due to Turborepo cache hits.
- **Client Route Bundles Size**: NextJS static optimization yields lightweight client footprints:
  - `web` Route: First-load size ranges from **88kB** to **192kB**.
  - `admin` Route: First-load size ranges from **87kB** to **88kB**.

---

## 2. API & Thread Runtime Optimizations

We implemented two key updates to ensure high runtime performance under load:

### 2.1 Async Queue Decoupling (BullMQ)

- **Problem**: In the original prototype, LLM image analysis blocked the primary Node.js event loop, degrading HTTP request throughput.
- **Solution**: Background tasks are offloaded to Redis-backed queues. A separate worker process (`apps/worker`) handles tasks asynchronously, keeping the Express API server responsive.

### 2.2 Database Query Optimization

- **Mappers & Population**: Repositories use `.lean()` queries to retrieve raw JSON payloads from MongoDB, bypassing heavy Mongoose instances. Documents are mapped directly to typesafe models.

---

## 3. Core Web Vitals Gaps & Recommendations

Although backend processes are optimized, the frontend applications require monitoring in Sprint 1:

- **Mapbox Optimization**: Mapbox components load large assets and can block hydration if initialized eagerly.
  _Remediation_: Load Mapbox scripts dynamically (`next/dynamic` with `ssr: false`) and render map layouts only when the dashboard tab is active.
- **LCP Optimizations**: Image uploads must be compressed before rendering on feed lists.
  _Remediation_: Use Next.js `<Image />` elements instead of raw HTML `<img>` tags, and leverage Cloudinary image transformation APIs to deliver optimized image formats.
- **Real-Time Scaling**: Set up performance logging using `PerformanceObserver` APIs inside citizen dashboards to measure and report First Input Delay (FID) and Interaction to Next Paint (INP).
