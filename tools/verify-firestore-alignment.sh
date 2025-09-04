#!/bin/bash

set -euo pipefail

# Verify Firestore rules alignment between licensing website and dashboard repos
# Usage:
#   ./tools/verify-firestore-alignment.sh           # report only
#   ./tools/verify-firestore-alignment.sh --sync    # copy licensing rules to dashboard repo

ROOT_DIR="/Users/chebrooks/Documents/IDE_Project/BACKBONE 14_2 & Website 2 full project files"
LIC_RULES="$ROOT_DIR/dashboard-v14-licensing-website 2/firestore.rules"
DASH_RULES="$ROOT_DIR/Dashboard-v14_2/firestore.rules"

if [ ! -f "$LIC_RULES" ] || [ ! -f "$DASH_RULES" ]; then
  echo "❌ Could not find rules files:"
  echo "   Licensing: $LIC_RULES"
  echo "   Dashboard: $DASH_RULES"
  exit 1
fi

echo "🔎 Comparing Firestore rules..."
LIC_SUM=$(shasum -a 256 "$LIC_RULES" | awk '{print $1}')
DASH_SUM=$(shasum -a 256 "$DASH_RULES" | awk '{print $1}')

if [ "$LIC_SUM" = "$DASH_SUM" ]; then
  echo "✅ Rules are aligned (hash: $LIC_SUM)"
  exit 0
fi

echo "⚠️  Rules drift detected! Hashes differ:"
echo "   Licensing: $LIC_SUM"
echo "   Dashboard: $DASH_SUM"

echo
echo "--- Unified diff (Licensing → Dashboard) ---"
# Show minimal diff; don't fail if no diff (handled above)
diff -u "$DASH_RULES" "$LIC_RULES" || true

echo
if [[ "${1:-}" == "--sync" ]]; then
  echo "✍️  Sync requested: copying licensing rules to dashboard repo..."
  cp -f "$LIC_RULES" "$DASH_RULES"
  echo "✅ Sync complete. Re-checking..."
  LIC_SUM2=$(shasum -a 256 "$LIC_RULES" | awk '{print $1}')
  DASH_SUM2=$(shasum -a 256 "$DASH_RULES" | awk '{print $1}')
  if [ "$LIC_SUM2" = "$DASH_SUM2" ]; then
    echo "✅ Now aligned (hash: $LIC_SUM2)"
    exit 0
  else
    echo "❌ Unexpected: hashes still differ after sync"
    exit 2
  fi
else
  echo "ℹ️  To sync dashboard rules from licensing, run:"
  echo "    ./tools/verify-firestore-alignment.sh --sync"
fi
