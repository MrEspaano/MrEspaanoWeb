#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT_DIR="${ROOT_DIR}/assets/sora/prompts"
OUTPUT_DIR="${ROOT_DIR}/public/sora"
LOG_DIR="${ROOT_DIR}/tmp/sora"

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
SORA_CLI="${SORA_CLI:-$CODEX_HOME/skills/sora/scripts/sora.py}"
MODEL="${SORA_MODEL:-sora-2-pro}"
SIZE="${SORA_SIZE:-1280x720}"
SECONDS="${SORA_SECONDS:-4}"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY saknas. Sätt den i ditt shell och kör igen."
  echo "Exempel: export OPENAI_API_KEY='***'"
  exit 1
fi

if [[ ! -f "${SORA_CLI}" ]]; then
  echo "Hittar inte Sora CLI: ${SORA_CLI}"
  echo "Sätt SORA_CLI eller installera skillen i \$CODEX_HOME/skills/sora."
  exit 1
fi

if [[ ! -d "${PROMPT_DIR}" ]]; then
  echo "Hittar inte prompt-mappen: ${PROMPT_DIR}"
  exit 1
fi

mkdir -p "${OUTPUT_DIR}" "${LOG_DIR}" /tmp/uv-cache
export UV_CACHE_DIR="${UV_CACHE_DIR:-/tmp/uv-cache}"

echo "Genererar Sora-assets till ${OUTPUT_DIR}"
echo "Model=${MODEL} Size=${SIZE} Seconds=${SECONDS}"

for prompt_file in "${PROMPT_DIR}"/*.txt; do
  name="$(basename "${prompt_file}" .txt)"
  out_image="${OUTPUT_DIR}/${name}.webp"
  out_json="${LOG_DIR}/${name}.json"

  echo "-> ${name}"
  uv run --with openai python "${SORA_CLI}" create-and-poll \
    --model "${MODEL}" \
    --prompt-file "${prompt_file}" \
    --no-augment \
    --size "${SIZE}" \
    --seconds "${SECONDS}" \
    --download \
    --variant thumbnail \
    --out "${out_image}" \
    --json-out "${out_json}"
done

echo "Klart. Bilder sparade i ${OUTPUT_DIR}."
