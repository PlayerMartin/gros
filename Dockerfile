# syntax=docker/dockerfile:1
#
# Multi-stage build: install with pnpm, build & run with the Bun runtime.
# The app has zero native modules (bun:sqlite is built into the runtime),
# so no compiler toolchain is needed anywhere in this image.

# ---------------------------------------------------------------------------
# deps — resolve & install all dependencies (including dev, for the build)
# ---------------------------------------------------------------------------
FROM oven/bun:1.3 AS deps
WORKDIR /app

# pnpm is the package manager (matching the repo); install it via Bun itself.
RUN bun add -g pnpm@10.28.2

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# deps-prod — production-only dependencies for the lean runtime image
# ---------------------------------------------------------------------------
FROM oven/bun:1.3 AS deps-prod
WORKDIR /app

RUN bun add -g pnpm@10.28.2

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

# ---------------------------------------------------------------------------
# builder: run `next build` under the Bun runtime inside /app
# ---------------------------------------------------------------------------
FROM oven/bun:1.3 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `--bun` forces the Next.js CLI to execute on the Bun runtime (its shebang
# would otherwise try `node`, which does not exist in this image).
RUN bun --bun run build

# ---------------------------------------------------------------------------
# runtime: minimal image — baked .next output + prod node_modules only
# ---------------------------------------------------------------------------
FROM oven/bun:1.3 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root. The oven/bun image defines the `bun` user (uid 1000).
# Create the SQLite data dir before dropping privileges. The `bun` user owns
# everything under /app; the named/bind volume takes ownership at runtime.
USER root
RUN mkdir -p /app/data && chown -R bun:bun /app
USER bun

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["bun", "--bun", "run", "start"]