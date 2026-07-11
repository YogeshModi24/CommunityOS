# Render Deployment

CommunityOS is pre-configured to deploy on Render using a `render.yaml` Blueprint.

## 1. Prerequisites

- A Render account.
- A GitHub repository containing the CommunityOS source code.

## 2. Deploying

1. Connect your Render account to your GitHub.
2. In the Render Dashboard, click **New** -> **Blueprint**.
3. Select your repository.
4. Render will automatically read the `render.yaml` and provision:
   - `community-os-api` (Web Service)
   - `community-os-worker` (Background Worker)

## 3. Environment Variables

You will need to manually configure the following environment variables in the Render Dashboard for the API service (the Worker will inherit them):

- `MONGODB_URI`
- `REDIS_URL`
- `GROQ_API_KEY`
- `CLOUDINARY_*`
- `CLIENT_URL`
