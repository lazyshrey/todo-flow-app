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
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL

RUN npm run build --workspace=apps/web

# Stage 2: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache sqlite-libs

# Copy workspace configurations to install production dependencies
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/discord-bot/package.json ./apps/discord-bot/
COPY apps/mcp-server/package.json ./apps/mcp-server/

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy build outputs and source files from builder
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/database ./apps/web/database

EXPOSE 3000

# Start the web app
CMD ["npm", "run", "start", "--workspace=apps/web"]
