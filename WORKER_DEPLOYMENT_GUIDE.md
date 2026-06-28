# Worker Deployment Guide: Production Orchestration

This guide outlines deployment parameters, environments, resources, and probes configuration for the headless worker process.

---

## 1. Environment Configurations

The worker validates parameters at boot. The following variables must be defined in the container runtime:

| Variable              | Description                                        | Required | Example                               |
| :-------------------- | :------------------------------------------------- | :------: | :------------------------------------ |
| `NODE_ENV`            | Run environment (`production`, `staging`, `local`) |   Yes    | `production`                          |
| `MONGODB_URI`         | Mongo connection string                            |   Yes    | `mongodb://mongodb:27017/communityos` |
| `REDIS_URL`           | Redis cluster URL                                  |   Yes    | `redis://redis:6379`                  |
| `NEXT_PUBLIC_API_URL` | Express server address (resolves AI fetches)       |   Yes    | `http://api:5001`                     |
| `OPENAI_API_KEY`      | Key for Vision AI models                           |   Yes    | `sk-proj-...`                         |

---

## 2. Process Supervisions

In production, the worker runs as a headless container process:

- **Supervisor**: Docker entry point runs `node dist/index.js`.
- **Restarts**: Configure `restart: always` or orchestration restart policies (Kubernetes `Deployment`) to ensure automatic recovery on memory faults or runtime crashes.
- **Resource Constraints**:
  - Memory limit: `512MB` recommended.
  - CPU limit: `0.5` vCPU.

---

## 3. Observability & Heartbeats

Since the worker has no HTTP interface (maximizing security), health signals are monitored via:

1. **Heartbeat Logs**: System operators parse worker logs for `[Worker Heartbeat]` status prints emitted every 60 seconds.
2. **Container Exit Signal**: If Mongoose or Redis loses connection permanently, the container exits with code `1`, triggering orchestration monitoring charts (e.g. Prometheus alerts on crash loopback).
3. **Queue depth monitoring**: Leverage Prometheus scraping endpoints on Redis to track waiting/active BullMQ jobs directly.
