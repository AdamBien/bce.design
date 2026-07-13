#!/usr/bin/env bash
# Fetches the standalone lit-html ES module into app/src/libs/.
# Usage: ./update-lit-html.sh [version]   (default: latest)
set -euo pipefail

VERSION="${1:-latest}"
TARGET="$(cd "$(dirname "$0")" && pwd)/app/src/libs/lit-html.js"

curl -fsSL "https://cdn.jsdelivr.net/npm/lit-html@${VERSION}/lit-html.js" -o "${TARGET}"

echo "lit-html updated in ${TARGET}"
