# Docker Deployment

CommunityOS provides multi-stage Dockerfiles optimized with Turbo pruning to keep image sizes small.

## Building Images

To build the API image:
```bash
docker build -f apps/api/Dockerfile -t community-os-api:latest .
```

To build the Worker image:
```bash
docker build -f apps/worker/Dockerfile -t community-os-worker:latest .
```

## Running with Docker Compose

A `docker-compose.yml` is provided for running the entire backend stack locally, including MongoDB and Redis.

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- API on port 5001
- Worker

## Production Environment Variables
Ensure you pass appropriate environment variables (`NODE_ENV=production`) and real values for API keys and database URIs when deploying to a production Docker Swarm or Kubernetes cluster.
