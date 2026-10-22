#!/bin/bash
# Installs dependencies so `npm test` and the type check work in Claude Code
# cloud sessions. Chromium for the e2e test is preinstalled there.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
