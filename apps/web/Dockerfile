# Stage 1: Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copy lock files and package.json files for dependency installation caching
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/discord-bot/package.json ./apps/discord-bot/
COPY apps/mcp-server/package.json ./apps/mcp-server/

# Install dependencies (will compile better-sqlite3 for alpine)
RUN npm ci

# Copy the rest of monorepo code
COPY . .

# Build Next.js app
RUN npm run build --workspace=apps/web

# Stage 2: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache sqlite-libs

# Copy dependencies and build outputs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/database ./apps/web/database

EXPOSE 3000

# Start the web app
CMD ["npm", "run", "start", "--workspace=apps/web"]
