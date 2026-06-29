# Local Development

To run CommunityOS locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` for `apps/api`, `apps/worker`, and `apps/web`.
   Populate them with actual values if you have them. Mock values will work for limited functionality.

3. Start backing services (MongoDB, Redis):
   ```bash
   docker-compose up -d mongo redis
   ```

4. Build shared packages:
   ```bash
   npm run build
   ```

5. Start all apps in dev mode:
   ```bash
   npm run dev
   ```
