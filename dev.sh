#!/bin/bash
set -e

echo ""
echo "==========================================="
echo "  PUMBLE REDR - Development Environment"
echo "==========================================="
echo ""

# Stop any existing containers
echo "[1/4] Stopping old containers..."
docker-compose down 2>/dev/null || true

# Start tunnel in background
echo "[2/4] Starting tunnel..."
docker-compose up -d tunnel

# Wait for tunnel URL
echo "[3/4] Waiting for tunnel URL..."
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

# Start app with tunnel URL
echo "[4/4] Starting app with tunnel URL..."
echo ""
export TUNNEL_URL
docker-compose up --build app
