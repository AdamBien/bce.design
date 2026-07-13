#!/usr/bin/env bash
# Fetches the standalone lit-html ES module from the npm registry.
# Usage: ./update-lit-html.sh 3.3.3
set -euo pipefail

TMP=$(mktemp)
curl -fsSL "https://registry.npmjs.org/lit-html/-/lit-html-${1:?version required, e.g. 3.3.3}.tgz" \
    | tar -xzO package/lit-html.js > "${TMP}"
mv "${TMP}" app/src/libs/lit-html.js
