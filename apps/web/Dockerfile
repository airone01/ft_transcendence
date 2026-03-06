# ==========================================
# Pruner
# ==========================================
FROM oven/bun:1-alpine AS pruner
USER root
WORKDIR /app
COPY . .
ENV TURBO_TELEMETRY_DISABLED=1
RUN bunx turbo prune @transc/web --docker

# ==========================================
# Installer
# ==========================================
FROM oven/bun:1-alpine AS installer
USER root
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# ==========================================
# Builder
# ==========================================
FROM oven/bun:1-alpine AS builder
USER root
WORKDIR /app
COPY --from=installer /app/ .

ENV DATABASE_URL=spoof
ENV TURBO_TELEMETRY_DISABLED=1
RUN bunx turbo run build --filter=@transc/web

# ==========================================
# Runner
# ==========================================
FROM oven/bun:1-alpine AS runner
USER root
WORKDIR /app

ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000

COPY --from=builder /app/apps/web/build ./apps/web/build
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

RUN chown -R bun:bun /app

USER bun
EXPOSE 3000

CMD ["bun", "run", "apps/web/build/index.js"]
