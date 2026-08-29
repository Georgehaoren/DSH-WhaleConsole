#!/bin/zsh

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 INPUT.png OUTPUT.icns" >&2
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_DIR="$(cd "$(dirname "$1")" && pwd)"
INPUT="$INPUT_DIR/$(basename "$1")"
OUTPUT_DIR="$(dirname "$2")"
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"
OUTPUT="$OUTPUT_DIR/$(basename "$2")"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "PNG to ICNS conversion requires macOS." >&2
  exit 1
fi

for command_name in sips pnpm; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

if [ ! -f "$INPUT" ]; then
  echo "Input PNG not found: $INPUT" >&2
  exit 1
fi

WIDTH="$(sips -g pixelWidth "$INPUT" 2>/dev/null | awk '/pixelWidth/ { print $2 }')"
HEIGHT="$(sips -g pixelHeight "$INPUT" 2>/dev/null | awk '/pixelHeight/ { print $2 }')"

if [ -z "$WIDTH" ] || [ "$WIDTH" != "$HEIGHT" ]; then
  echo "Input must be a square PNG: $INPUT" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dsh-whale-console-icon.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT

(cd "$ROOT_DIR" && pnpm --filter @dsh-whale-console/launcher exec tauri icon "$INPUT" --output "$WORK_DIR/generated" >/dev/null)

if [ ! -f "$WORK_DIR/generated/icon.icns" ]; then
  echo "Tauri did not generate icon.icns for $INPUT" >&2
  exit 1
fi

cp "$WORK_DIR/generated/icon.icns" "$OUTPUT"
echo "Created $OUTPUT"
