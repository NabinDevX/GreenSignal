#!/bin/sh
set -eu

: "${MODEL_NAME:=smollm2:135m}"
: "${OLLAMA_HOST:=127.0.0.1:11434}"
: "${MODEL_RUNNER_BASE_URL:=http://127.0.0.1:11434/v1}"

case "$MODEL_NAME" in
  docker.io/ai/*)
    docker_model_name="$MODEL_NAME"
    MODEL_NAME=smollm2:135m
    echo "[GroundSignal] Ignoring Docker Model Runner model ${docker_model_name}; using ${MODEL_NAME} for Ollama"
    ;;
esac

export OLLAMA_HOST

echo "[GroundSignal] Starting Ollama on ${OLLAMA_HOST}"
ollama serve >/tmp/groundsignal-ollama.log 2>&1 &
ollama_pid=$!

cleanup() {
  kill "$ollama_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

ready=0
for attempt in $(seq 1 60); do
  if curl --fail --silent "http://${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "[GroundSignal] Ollama did not become ready within 60 seconds" >&2
  cat /tmp/groundsignal-ollama.log >&2 || true
  exit 1
fi

echo "[GroundSignal] Ensuring model ${MODEL_NAME} is available"
ollama pull "${MODEL_NAME}"

export MODEL_RUNNER_BASE_URL MODEL_NAME
echo "[GroundSignal] Starting API on port ${PORT:-10000}"
exec bun run /app/apps/api/src/server.ts
