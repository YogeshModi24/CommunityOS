# Railway Deployment

CommunityOS backend services (API, Worker, MongoDB, Redis) can easily be deployed on Railway.

## 1. Setup Data Stores
1. Create a new Railway Project.
2. Add **MongoDB** from the template library.
3. Add **Redis** from the template library.

## 2. Deploy API and Worker
Because Railway does not natively support multiple services from a single repository root without custom Nixpacks configurations, the easiest approach is to use our multi-stage Dockerfiles.

1. Add a **New Service** -> **GitHub Repo**.
2. Select your CommunityOS repo.
3. In the service settings, change the **Builder** to Dockerfile.
4. Set the **Dockerfile Path** to `apps/api/Dockerfile` for the API service.
5. Create a second service using the same repo, setting the Dockerfile Path to `apps/worker/Dockerfile`.

## 3. Environment Variables
Add all required environment variables, ensuring that you use Railway's provided `MONGO_URL` and `REDIS_URL` variables.
