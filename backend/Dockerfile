# ==============================================================================
# Multi-Stage Dockerfile for Kissan Mithar Backend (AWS Lambda Container Image)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage (compile TypeScript & generate Prisma client)
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine generation
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies (respecting package-lock.json)
# Note: prisma folder must be copied before npm ci because package.json postinstall runs "prisma generate"
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Copy application source code and TypeScript config
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist/
RUN npm run build

# Prune development dependencies to keep final image slim
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Stage 2: Production AWS Lambda Runner Image
# ------------------------------------------------------------------------------
FROM public.ecr.aws/lambda/nodejs:20

# LAMBDA_TASK_ROOT is /var/task (default working directory for AWS Lambda)
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Copy package metadata and prisma schema/engines
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set production environment flag
ENV NODE_ENV=production

# Default handler: API Gateway HTTP API -> Express handler
# (Can be overridden by SAM ImageConfig.Command, e.g. for EventBridge cleanup handler)
CMD [ "dist/lambda.handler" ]
