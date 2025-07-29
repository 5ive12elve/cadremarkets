#!/bin/bash

echo "🚀 Starting CadreMarkets Development Environment..."

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node api/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# Wait a moment for processes to clean up
sleep 2

# Start both servers using the npm script
echo "📦 Starting API and Client servers..."
npm run dev:all

echo "✅ Development environment started!"
echo "🌐 API Server: http://localhost:3000"
echo "🎨 Client Server: http://localhost:5173" 