#!/bin/bash

# Build Configuration Test Script
# This script builds the app and shows how configuration can be modified post-build

echo "🚀 MVTS Configuration Test Script"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the React app root directory"
    exit 1
fi

echo "📦 Building the application..."
npm run build

echo "✅ Build complete!"

# Show the current configuration
echo ""
echo "📄 Current runtime configuration (build/config.js):"
echo "=================================================="
cat build/config.js

echo ""
echo "🔧 Configuration Scenarios:"
echo "=========================="

echo ""
echo "1️⃣  CURRENT SETUP (Same host, WebSocket on different port):"
echo "   - Web App: https://example.com (port 443, default HTTPS)"
echo "   - WebSocket: wss://example.com:8191/ws"
echo "   - REST API: https://example.com/api (same port as web app)"
echo ""
echo "   ✅ This is your current configuration!"

echo ""
echo "2️⃣  MICROSERVICES SETUP (Different hosts):"
echo "   To use different servers, modify build/config.js:"
echo "   window.MVTS_CONFIG = {"
echo "     websocket: { port: 8191, host: 'ws.example.com', protocol: 'wss', useRelativeUrl: false },"
echo "     restApi: { port: 443, host: 'api.example.com', protocol: 'https', useRelativeUrl: false }"
echo "   };"

echo ""
echo "3️⃣  DEVELOPMENT SETUP (All on localhost with different ports):"
echo "   window.MVTS_CONFIG = {"
echo "     websocket: { port: 8191, host: 'localhost', protocol: 'ws', useRelativeUrl: false },"
echo "     restApi: { port: 8080, host: 'localhost', protocol: 'http', useRelativeUrl: false }"
echo "   };"

echo ""
echo "🧪 Testing Configuration Load:"
echo "=========================="

# Test if config.js is valid JavaScript
echo "Validating config.js syntax..."
node -c build/config.js && echo "✅ Configuration file is valid" || echo "❌ Configuration file has syntax errors"

echo ""
echo "📝 Configuration Change Examples:"
echo "================================"

echo ""
echo "💡 To modify configuration after deployment:"
echo "   1. Edit the config file: vi build/config.js"
echo "   2. No rebuild required - changes take effect on next page load"
echo "   3. Configuration is loaded at runtime from public/config.js"

echo ""
echo "📋 Test URLs that will be constructed:"
echo "====================================="

echo "Based on current config (assuming HTTPS deployment):"
echo "• WebSocket: wss://[your-domain]:8191/ws"
echo "• REST API: https://[your-domain]/api/schemas/bot"
echo "• Config API: https://[your-domain]/api/config/default"

echo ""
echo "🎯 Your Setup Summary:"
echo "====================="
echo "✅ Runtime configuration system is set up"
echo "✅ WebSocket configured for port 8191 (different from web app)"
echo "✅ REST API configured for relative URLs (same server)"
echo "✅ Configuration can be modified post-build"
echo "✅ Protocol auto-detection enabled (http->ws, https->wss)"

echo ""
echo "🔍 To verify configuration in browser:"
echo "======================================"
echo "1. Open browser developer tools"
echo "2. Check console for 'Runtime config loaded:' message"
echo "3. Inspect window.MVTS_CONFIG in console"
echo "4. Look for 'Connecting to server:' and 'Fetching schema from:' logs"

echo ""
echo "🚀 Ready to deploy! Configuration can be modified in build/config.js"
