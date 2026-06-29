# Production Checklist

Before launching CommunityOS to production, verify the following:

- [ ] **Environment Variables:** All mock values in `.env` have been replaced with real credentials.
- [ ] **Database Indexes:** MongoDB has all required indexes built (these are created by the worker on boot, but verify in Atlas).
- [ ] **CORS Security:** Ensure `CLIENT_URL` is set correctly on the backend, and Vercel points to the correct `NEXT_PUBLIC_API_URL`.
- [ ] **Authentication:** Generate random 32+ character secrets for `JWT_SECRET`, `NEXTAUTH_SECRET`, and `AUTH_SECRET`.
- [ ] **Cloudinary Setup:** Ensure your Cloudinary account has an Unsigned Upload Preset configured that matches `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
- [ ] **Health Checks:** Hit `/health` and `/ready` endpoints on your deployed API to verify database and Redis connectivity.
- [ ] **Build Validation:** Run `npm run clean && npm install && npm run build` locally to ensure Turborepo cleanly compiles all assets with no warnings.
