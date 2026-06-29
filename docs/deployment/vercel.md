# Vercel Deployment

The CommunityOS frontend (`apps/web`) is fully optimized for deployment on Vercel.

## 1. Importing the Project
1. Go to your Vercel Dashboard and click **Add New** -> **Project**.
2. Select your repository.
3. In the project settings, set the **Root Directory** to `apps/web`.
4. Vercel will automatically detect that this is a Next.js project.

## 2. Environment Variables
Add all the variables from `apps/web/.env.example` to the Vercel dashboard.

Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` point to your deployed backend (e.g., Render, Railway, or Custom Server).

## 3. Deployment
Click **Deploy**. Vercel will automatically run `npm run build` using Turbo and deploy your Next.js application to the Edge.
