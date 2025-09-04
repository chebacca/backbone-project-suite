#!/bin/bash

# Fix Enterprise User in Production
# This script fixes the enterprise.user@example.com credentials and project access

set -e

echo "🚀 Fixing Enterprise User in Production..."

# Navigate to licensing website server
cd "dashboard-v14-licensing-website 2/server"

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running enterprise user fix..."
node fix-enterprise-user.js

echo "🌱 Re-seeding database with correct credentials..."
npm run seed

echo "🔄 Restarting services..."

# Kill existing processes
echo "🛑 Stopping existing services..."
pkill -f "node.*server" || true
pkill -f "npm.*dev" || true

# Wait a moment for processes to stop
sleep 2

echo "🚀 Starting licensing website server..."
npm run dev &

# Navigate to dashboard
cd "../../Dashboard-v14_2"

echo "🚀 Starting dashboard server..."
npm run dev:server &

echo "🌐 Starting dashboard web app..."
npm run dev:web &

echo "✅ All services started!"
echo ""
echo "🔗 Services:"
echo "   📊 Dashboard: http://localhost:3000"
echo "   🔧 Dashboard API: http://localhost:3001"
echo "   💳 Licensing Website: http://localhost:3002"
echo "   🔌 Licensing API: http://localhost:3003"
echo ""
echo "👤 Enterprise User Credentials:"
echo "   📧 Email: enterprise.user@example.com"
echo "   🔑 Password: Admin1234!"
echo ""
echo "🧪 Test Login:"
echo "   curl -X POST http://localhost:3003/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"enterprise.user@example.com\",\"password\":\"Admin1234!\"}'"
echo ""
echo "🎉 Fix completed! The enterprise user should now be able to see their projects."
