# ==========================================
# Pruner
# ==========================================
FROM oven/bun:1.3-alpine AS pruner
USER root
WORKDIR /app
COPY . .
ENV TURBO_TELEMETRY_DISABLED=1
RUN bunx turbo prune @transc/web --docker

# ==========================================
# Installer
# ==========================================
FROM oven/bun:1.3-alpine AS installer
USER root
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# ==========================================
# Builder
# ==========================================
FROM oven/bun:1.3-alpine AS builder
USER root
WORKDIR /app
COPY --from=installer /app/ .

ENV DATABASE_URL=spoof
ENV TURBO_TELEMETRY_DISABLED=1
RUN bunx turbo run build --filter=@transc/web

# ==========================================
# Installer (only prod deps)
# ==========================================
FROM oven/bun:1.3-alpine AS prod-installer
USER root
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile --production

# ==========================================
# Runner
# ==========================================
FROM oven/bun:1.3-alpine AS runner
USER root
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=bun:bun /app/apps/web/build ./apps/web/build
COPY --from=builder --chown=bun:bun /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=bun:bun /app/packages/db ./packages/db
COPY --from=builder --chown=bun:bun /app/package.json ./package.json

COPY --from=prod-installer --chown=bun:bun /app/node_modules ./node_modules
COPY --from=prod-installer --chown=bun:bun /app/apps/web/node_modules ./apps/web/node_modules

USER bun
EXPOSE 3000
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -kI http://localhost:3000
CMD ["bun", "run", "apps/web/build/index.js"]
