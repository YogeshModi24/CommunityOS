# Deployment Guide

CommunityOS is designed to be easily deployed to modern cloud platforms.

## Frontend (Vercel)
The `web` application is optimized for Vercel. 
- Set the Build Command to `npm run build`
- Output directory: `apps/web/.next`

## Backend (Render / Railway)
The `api` and `worker` applications can be deployed as Docker containers or standard Node.js services.
Ensure you set the `PORT`, `MONGODB_URI`, and `JWT_SECRET` environment variables.

## Database (MongoDB Atlas)
Use a MongoDB Atlas M0 (Free Tier) or higher cluster.
