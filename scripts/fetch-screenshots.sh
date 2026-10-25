#!/usr/bin/env bash
# Download the newest iOS screenshot set from GitHub Actions to your Desktop.
#
#   ./scripts/fetch-screenshots.sh              # latest run
#   ./scripts/fetch-screenshots.sh 40160071513  # a specific run
#
# Artifacts on GitHub require a logged-in session even for public repositories,
# so this uses the authenticated `gh` CLI rather than a plain URL.
set -euo pipefail

REPO="${REPO:-ernestoho/nomadalingo-app}"
DEST="${DEST:-$HOME/Desktop/nomadalingo-screenshots}"
WORKFLOW="${WORKFLOW:-ios-screenshots.yml}"

RUN_ID="${1:-}"
if [ -z "$RUN_ID" ]; then
  RUN_ID=$(gh run list --repo "$REPO" --workflow "$WORKFLOW" --limit 1 \
    --json databaseId --jq '.[0].databaseId')
fi

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "No workflow runs found for $WORKFLOW in $REPO." >&2
  exit 1
fi

echo "Fetching screenshots from run $RUN_ID ($REPO)"
mkdir -p "$DEST"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

gh run download "$RUN_ID" --repo "$REPO" -n ios-screenshots -D "$TMP"
cp "$TMP"/*.png "$DEST"/ 2>/dev/null || true

if [ -z "$(find "$DEST" -maxdepth 1 -name '*.png' -print -quit)" ]; then
  echo "No PNGs were produced by run $RUN_ID." >&2
  exit 1
fi

echo
echo "Saved to: $DEST"
for f in "$DEST"/*.png; do
  printf '  %-28s ' "$(basename "$f")"
  sips -g pixelWidth -g pixelHeight "$f" | tail -2 | tr -d '\n' | sed 's/  */ /g'
  echo
done
