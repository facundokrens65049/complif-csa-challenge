#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

load_env() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  fi
}

load_env "$ROOT/.env"

if [[ -z "${POSTGRES_URL:-}" ]]; then
  echo "Set POSTGRES_URL (see .env.example)." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required (brew install libpq)." >&2
  exit 1
fi

FILE="${1:?usage: apply.sh <sql-file>}"
if [[ "$FILE" != /* ]]; then
  FILE="$ROOT/$FILE"
fi

psql "$POSTGRES_URL" -v ON_ERROR_STOP=1 -f "$FILE"
