#!/bin/sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
ICON_DIR="$ROOT_DIR/bolao-app/public/icons"
SOURCE_IMAGE="$ICON_DIR/icon-source.png"

mkdir -p "$ICON_DIR"

sips -s format png -z 192 192 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-192.png" >/dev/null
sips -s format png -z 512 512 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-512.png" >/dev/null
sips -s format png -z 512 512 "$SOURCE_IMAGE" --out "$ICON_DIR/maskable-512.png" >/dev/null
sips -s format png -z 180 180 "$SOURCE_IMAGE" --out "$ICON_DIR/apple-touch-icon.png" >/dev/null

printf 'Generated icons in %s\n' "$ICON_DIR"
