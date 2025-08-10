#!/bin/bash

echo "🧪 Running Profile Update Tests..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the api directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if test dependencies are available
if ! npm list chai > /dev/null 2>&1; then
    echo "📦 Installing test dependencies..."
    npm install --save-dev chai supertest mongodb-memory-server
fi

# Run the tests
echo "🚀 Starting tests..."
npx mocha tests/profile-update.test.js --timeout 10000

echo "✅ Tests completed!" 