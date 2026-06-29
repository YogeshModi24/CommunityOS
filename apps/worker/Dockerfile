FROM node:20-alpine AS base

# 1. Prune the workspace for worker
FROM base AS pruner
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune worker --docker

# 2. Add lockfile and install dependencies
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci

# 3. Build the project
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=worker...

# 4. Final runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy everything from installer
COPY --from=installer /app .

CMD ["npm", "run", "start", "--workspace=worker"]
