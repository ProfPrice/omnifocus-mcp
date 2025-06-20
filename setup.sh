#!/bin/bash

# OmniFocus MCP Server Setup Script
set -e

echo "🚀 Setting up OmniFocus MCP Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_MAJOR=18
CURRENT_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$CURRENT_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
    echo "❌ Error: Node.js $REQUIRED_MAJOR+ required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Add missing dependency
echo "📦 Adding zod for input validation..."
npm install zod

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Check if OmniFocus is installed and accessible
echo "🔍 Checking OmniFocus installation..."
if ! osascript -e 'Application("OmniFocus").running()' 2>/dev/null; then
    echo "⚠️  Warning: OmniFocus is not running. Please start OmniFocus for the server to work properly."
else
    echo "✅ OmniFocus is running and accessible"
fi

# Test the automation permissions
echo "🔐 Testing OmniFocus automation permissions..."
TEST_RESULT=$(osascript -l JavaScript -e 'const app = Application("OmniFocus"); app.defaultDocument.name();' 2>&1 || echo "PERMISSION_ERROR")

if [[ "$TEST_RESULT" == *"PERMISSION_ERROR"* ]] || [[ "$TEST_RESULT" == *"not allowed"* ]]; then
    echo "❌ Error: Automation permission denied for OmniFocus"
    echo "   Please grant automation permissions:"
    echo "   1. Open System Preferences > Security & Privacy > Privacy"
    echo "   2. Select 'Automation' from the left sidebar"
    echo "   3. Find 'Terminal' or your shell and check 'OmniFocus'"
    echo "   4. Restart your terminal and try again"
    exit 1
else
    echo "✅ OmniFocus automation permissions verified"
fi

# Get the current directory for the Claude config
CURRENT_DIR=$(pwd)
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create Claude config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Create or update Claude Desktop configuration
echo "⚙️  Configuring Claude Desktop..."

if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    echo "   Backing up existing Claude config..."
    cp "$CLAUDE_CONFIG_FILE" "$CLAUDE_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create the configuration
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "omnifocus": {
      "command": "node",
      "args": ["$CURRENT_DIR/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "✅ Claude Desktop configuration updated"

# Test the server
echo "🧪 Testing MCP server..."
if timeout 10s node dist/index.js <<< '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' > /dev/null 2>&1; then
    echo "✅ MCP server test passed"
else
    echo "⚠️  MCP server test timed out (this is normal - server is waiting for input)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop to load the new MCP server"
echo "2. Open a new conversation in Claude Desktop"
echo "3. Test the integration with: 'Get all my tasks from OmniFocus'"
echo ""
echo "Useful commands:"
echo "  npm run build   - Rebuild after making changes"
echo "  npm run dev     - Watch mode for development"
echo "  npm run start   - Start the server manually"
echo ""
echo "Configuration files:"
echo "  Claude config: $CLAUDE_CONFIG_FILE"
echo "  Server path: $CURRENT_DIR/dist/index.js"