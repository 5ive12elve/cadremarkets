#!/bin/bash

echo "🧹 Cleaning up existing processes..."

# Kill any processes using our development ports
echo "   Stopping processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "   Stopping processes on port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Kill any nodemon, node, or vite processes related to our project
echo "   Stopping Node.js development processes..."
pkill -f "nodemon api/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# Wait a moment for processes to fully stop
sleep 2

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Starting development environment..."
echo ""

# Start the development servers
npm run dev:all 