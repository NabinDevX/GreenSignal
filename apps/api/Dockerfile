FROM oven/bun:1.4.3

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl zstd \
  && curl -fsSL https://ollama.com/install.sh | sh \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/tsconfig/base.json packages/tsconfig/base.json

RUN bun install --frozen-lockfile --production

COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/tsconfig packages/tsconfig

ENV NODE_ENV=production \
    PORT=10000 \
    MODEL_RUNNER_BASE_URL=http://127.0.0.1:11434/v1 \
    MODEL_NAME=smollm2:135m \
    MODEL_REQUEST_TIMEOUT_MS=180000 \
    DATABASE_PATH=/app/apps/api/data/groundsignal.sqlite \
    OLLAMA_HOST=127.0.0.1:11434

RUN chmod +x /app/apps/api/docker-entrypoint.sh \
  && mkdir -p /app/apps/api/data

EXPOSE 10000

ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
