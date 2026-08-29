#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MODULE_CACHE="${TMPDIR:-/tmp}/dsh-whale-console-swift-cache"

mkdir -p "$MODULE_CACHE"
cd "$ROOT_DIR"

export CLANG_MODULE_CACHE_PATH="$MODULE_CACHE"
export SWIFT_MODULECACHE_PATH="$MODULE_CACHE"

exec xcrun swift -module-cache-path "$MODULE_CACHE" scripts/render-skin-thumbnails.swift
