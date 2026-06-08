# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy lock files and package.json files for dependency installation caching
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/discord-bot/package.json ./apps/discord-bot/
COPY apps/mcp-server/package.json ./apps/mcp-server/

# Install dependencies
RUN npm ci

# Copy the rest of monorepo code
COPY . .

# Build MCP server app
RUN npm run build --workspace=apps/mcp-server

# Stage 2: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies and build outputs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/mcp-server/package.json ./apps/mcp-server/package.json
COPY --from=builder /app/apps/mcp-server/dist ./apps/mcp-server/dist

EXPOSE 3011

# Start the MCP server
CMD ["npm", "run", "start", "--workspace=apps/mcp-server"]
