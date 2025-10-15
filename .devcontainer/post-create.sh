#!/bin/bash
set -e

echo "🚀 Setting up Browser.autos Backend development environment..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Setup Playwright browsers (already included in the base image, but ensure latest)
echo "🎭 Verifying Playwright installation..."
npx playwright install --with-deps chromium || true

# Setup git safe directory
echo "🔧 Configuring git..."
git config --global --add safe.directory /workspace

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating default .env file..."
    cat > .env << 'EOF'
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Authentication
JWT_SECRET=dev-secret-change-in-production
TOKEN_EXPIRY=30d
REQUIRE_AUTH=true

# Default Admin Credentials
DEFAULT_ADMIN_USERNAME=browserautos
DEFAULT_ADMIN_PASSWORD=browser.autos
DEFAULT_ADMIN_EMAIL=admin@browser.autos

# Default API User Credentials
DEFAULT_API_USERNAME=api-user
DEFAULT_API_PASSWORD=browser.autos
DEFAULT_API_EMAIL=api@browser.autos

# Browser Pool Configuration
BROWSER_POOL_MIN=1
BROWSER_POOL_MAX=5
BROWSER_TIMEOUT=30000

# Queue System (Redis)
ENABLE_QUEUE=false
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000

# CORS
CORS_ORIGIN=*
EOF
    echo "✅ Created .env file with default values"
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Quick Start:"
echo "  1. Start development server: npm run dev"
echo "  2. Run tests: npm test"
echo "  3. Build: npm run build"
echo "  4. Start production: npm start"
echo ""
echo "🌐 Service URLs:"
echo "  - API Server: http://localhost:3001"
echo "  - API Docs: http://localhost:3001/docs"
echo "  - Health Check: http://localhost:3001/health"
echo ""
echo "🔑 Default Credentials:"
echo "  - Admin: browserautos / browser.autos"
echo "  - API User: api-user / browser.autos"
echo ""
