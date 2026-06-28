# Performance Baseline: Metrics & Targets

- **Version**: 1.0.0
- **Status**: Completed
- **Owner**: Lead Staff Engineer & CTO

This baseline outlines performance bottlenecks, page speeds, and bundle targets for the CommunityOS frontend and backend API.

---

## 1. System Bottleneck Audit

| Metric Vector                      | Current Profile                   | Blueprint Target Metric             | Improvement Plan                                                                               |
| :--------------------------------- | :-------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------- |
| **API Latency**                    | `120ms` average for `/api/issues` | `< 50ms` average for paginated data | Implement Redis read caching for public lists. Add composite Postgres indexes on status/score. |
| **Largest Contentful Paint (LCP)** | `2.4s` on landing page            | `< 1.2s`                            | Optimize Unspslash placeholder images. Set Next.js image priority flags.                       |
| **First Input Delay (FID)**        | `45ms`                            | `< 15ms`                            | Defer Mapbox-gl script initialization until the map route is active.                           |
| **Background AI processing**       | `3s` processing time              | `< 1s` queue handoff                | Isolate queue jobs in `apps/worker` to prevent blocking the API event loops.                   |

---

## 2. Bundle Size Profile

- **`apps/web` (Client Bundle)**:
  - Total JS Bundle: `480 KB` uncompressed.
  - Heavy imports: `framer-motion` (dynamically imported), `mapbox-gl` (requires lazy load wrappers).
- **`apps/api` (Server Memory)**:
  - Startup RAM usage: `85 MB`.
  - Optimization target: Extract queue workers out of API memory space to keep Express instances at `< 50 MB` memory footprint.
