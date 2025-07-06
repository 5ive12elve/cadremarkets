#!/bin/bash

# Development Environment Switcher
# Usage: ./scripts/dev-env.sh [local|prod]

case "$1" in
  "local")
    echo "Switching to LOCAL API (localhost:3000)..."
    rm -f .env.local
    echo "✅ Now using local API at http://localhost:3000"
    echo "📝 Make sure your local API server is running: cd ../api && npm start"
    ;;
  "prod")
    echo "Switching to PRODUCTION API (api.cadremarkets.com)..."
    echo "VITE_API_URL=https://api.cadremarkets.com" > .env.local
    echo "NODE_ENV=development" >> .env.local
    echo "✅ Now using production API at https://api.cadremarkets.com"
    ;;
  *)
    echo "Usage: ./scripts/dev-env.sh [local|prod]"
    echo ""
    echo "Options:"
    echo "  local  - Use local API server (localhost:3000)"
    echo "  prod   - Use production API server (api.cadremarkets.com)"
    echo ""
    echo "Current environment:"
    if [ -f .env.local ]; then
      echo "  📡 API: Production (api.cadremarkets.com)"
    else
      echo "  📡 API: Local (localhost:3000)"
    fi
    ;;
esac 