#!/bin/bash
set -e

echo ""
echo "==========================================="
echo "  PUMBLE REDR - Development Environment"
echo "==========================================="
echo ""

# Load env vars from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Load Pumble app credentials from .pumbleapprc
if [ -f .pumbleapprc ]; then
    export PUMBLE_APP_ID=$(grep -o '"PUMBLE_APP_ID"[^,]*' .pumbleapprc | cut -d'"' -f4)
    export PUMBLE_APP_KEY=$(grep -o '"PUMBLE_APP_KEY"[^,]*' .pumbleapprc | cut -d'"' -f4)
    export PUMBLE_APP_CLIENT_SECRET=$(grep -o '"PUMBLE_APP_CLIENT_SECRET"[^,]*' .pumbleapprc | cut -d'"' -f4)
    export PUMBLE_APP_SIGNING_SECRET=$(grep -o '"PUMBLE_APP_SIGNING_SECRET"[^,]*' .pumbleapprc | cut -d'"' -f4)
fi

# Stop any existing containers
echo "[1/5] Stopping old containers..."
docker-compose down 2>/dev/null || true
docker stop pumble-dev 2>/dev/null || true

# Build production image
echo "[2/5] Building app..."
docker-compose -f docker-compose.prod.yml build

# Start tunnel in background
echo "[3/5] Starting tunnel..."
docker-compose up -d tunnel

# Wait for tunnel URL
echo "[4/5] Waiting for tunnel URL..."
TUNNEL_URL=""
for i in {1..30}; do
    TUNNEL_URL=$(docker-compose logs tunnel 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
    sleep 1
    echo "       Waiting... ($i/30)"
done

if [ -z "$TUNNEL_URL" ]; then
    echo ""
    echo "ERROR: Failed to get tunnel URL"
    echo ""
    docker-compose logs tunnel
    exit 1
fi

echo ""
echo "==========================================="
echo "  TUNNEL READY"
echo "==========================================="
echo ""
echo "  Tunnel URL:   $TUNNEL_URL"
echo "  Manifest URL: $TUNNEL_URL/manifest"
echo ""
echo "  Go to https://developer.marketplace.cake.com"
echo "     and set manifest URL to:"
echo ""
echo "     $TUNNEL_URL/manifest"
echo ""
echo "==========================================="
echo ""

# Create tokens.json if not exists
touch tokens.json

# Start app with tunnel URL (using node directly, not pumble-cli)
echo "[5/5] Starting app..."
echo ""

docker run --rm -it \
    --name pumble-dev \
    -p 8183:8183 \
    -v "$(pwd)/tokens.json:/app/tokens.json" \
    -e PUMBLE_APP_ID="$PUMBLE_APP_ID" \
    -e PUMBLE_APP_KEY="$PUMBLE_APP_KEY" \
    -e PUMBLE_APP_CLIENT_SECRET="$PUMBLE_APP_CLIENT_SECRET" \
    -e PUMBLE_APP_SIGNING_SECRET="$PUMBLE_APP_SIGNING_SECRET" \
    -e ADDON_HOST="$TUNNEL_URL" \
    -e PUMBLE_ADDON_PORT=8183 \
    -e REDR_API_URL="${REDR_API_URL}" \
    -e REDR_API_KEY="${REDR_API_KEY}" \
    -e REDR_DOMAIN_ID="${REDR_DOMAIN_ID}" \
    -e REDR_FOLDER_NAME="${REDR_FOLDER_NAME:-pumble}" \
    pumble-redr-io-app:latest
