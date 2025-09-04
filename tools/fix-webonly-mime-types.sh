#!/bin/bash

# Fix WebOnly MIME Type Issues
# This script rebuilds the dashboard with proper MIME type configuration

set -e

echo "🔧 Fixing WebOnly MIME Type Issues..."

# Navigate to dashboard web app
cd "Dashboard-v14_2/apps/web"

echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building for production with proper MIME types..."
npm run build

echo "📋 Copying MIME type configuration files..."
cp public/.htaccess dist/
cp public/_headers dist/
cp public/manifest.json dist/

echo "🔍 Verifying build output..."
if [ -d "dist/js" ]; then
    echo "✅ JavaScript modules found in dist/js/"
    ls -la dist/js/ | head -5
else
    echo "❌ JavaScript modules not found!"
    exit 1
fi

if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html not found!"
    exit 1
fi

echo "🌐 Setting up local server with proper MIME types..."

# Create a simple HTTP server with proper MIME types
cat > dist/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set proper MIME types
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (req.path.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (req.path.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  // Don't serve index.html for asset requests
  if (req.path.startsWith('/js/') || 
      req.path.startsWith('/assets/') || 
      req.path.includes('.')) {
    return res.status(404).send('Not Found');
  }
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard WebOnly server running on http://localhost:${PORT}`);
  console.log('✅ MIME types properly configured');
  console.log('✅ SPA routing enabled');
  console.log('✅ CORS headers set');
});
EOF

# Install express for the local server
cd dist
npm init -y
npm install express

echo "🚀 Starting local server with proper MIME types..."
echo ""
echo "🌐 Dashboard WebOnly Mode:"
echo "   📊 URL: http://localhost:3000"
echo "   🔧 MIME Types: Fixed"
echo "   📋 Manifest: Fixed"
echo "   🔐 CORS: Enabled"
echo ""
echo "👤 Test with Enterprise User:"
echo "   📧 Email: enterprise.user@example.com"
echo "   🔑 Password: Admin1234!"
echo ""
echo "🧪 To test:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Login with enterprise user credentials"
echo "   3. Navigate to Cloud Projects page"
echo "   4. Verify projects are visible"
echo ""

# Start the server in the background
node server.js &
SERVER_PID=$!

echo "✅ Server started with PID: $SERVER_PID"
echo "🛑 To stop server: kill $SERVER_PID"
echo ""
echo "🎉 WebOnly MIME type issues fixed!"
echo "   - JavaScript modules now serve with correct MIME type"
echo "   - Manifest errors resolved"
echo "   - CORS headers properly set"
echo "   - SPA routing configured"
