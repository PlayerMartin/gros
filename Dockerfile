# syntax=docker/dockerfile:1
#
# Multi-stage build: install with pnpm, build & run with the Bun runtime.
# The app has zero native modules (bun:sqlite is built into the runtime),
# so no compiler toolchain is needed anywhere in this image.
#
# CPU portability: Bun's official Linux x64 binary targets the Haswell
# architecture (requires AVX2, 2013+) and dies with SIGILL ("Illegal
# instruction", exit 132) on older CPUs or VMs that mask CPU features — the
# production host here is a Fedora box without AVX2. The `bun-portable` stage
# below overlays the *baseline* build (Nehalem target, no AVX2 required) on
# hosts that need it; every other stage copies that same binary.

ARG BUN_VERSION=1.3.14

# ---------------------------------------------------------------------------
# bun-portable — /usr/local/bin/bun that runs on pre-Haswell x86_64 CPUs
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS bun-portable
ARG BUN_VERSION
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl unzip \
 && rm -rf /var/lib/apt/lists/* \
 && if [ "$(uname -m)" = "x86_64" ] && ! grep -q avx2 /proc/cpuinfo; then \
      cd /tmp \
      && curl -fsSL "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64-baseline.zip" -o bun-base.zip \
      && unzip -q bun-base.zip \
      && install -m 0755 bun-linux-x64-baseline/bun /usr/local/bin/bun \
      && rm -rf bun-linux-x64-baseline bun-base.zip \
      && echo "host lacks AVX2 -> using baseline bun ${BUN_VERSION}"; \
    fi

# ---------------------------------------------------------------------------
# deps — resolve & install all dependencies (including dev, for the build)
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS deps
COPY --from=bun-portable /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

# pnpm is the package manager (matching the repo); install it via Bun itself.
RUN bun add -g pnpm@10.28.2

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# deps-prod — production-only dependencies for the lean runtime image
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS deps-prod
COPY --from=bun-portable /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

RUN bun add -g pnpm@10.28.2

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

# ---------------------------------------------------------------------------
# builder: run `next build` under the Bun runtime inside /app
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS builder
COPY --from=bun-portable /usr/local/bin/bun /usr/local/bin/bun
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
FROM oven/bun:${BUN_VERSION} AS runner
COPY --from=bun-portable /usr/local/bin/bun /usr/local/bin/bun
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