# browser.autos API Server

Production-ready browser automation API powered by Playwright Chromium.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🐳 Docker

```bash
# Build image
docker build -t browser-autos -f docker/Dockerfile ..

# Run container
docker run -d -p 3001:3001 \
  -e JWT_SECRET=your-secret \
  --shm-size=2gb \
  browser-autos
```

## 📚 API Documentation

- **Interactive Docs**: http://localhost:3001/docs (Swagger UI)
- **Health Check**: http://localhost:3001/health
- **Prometheus Metrics**: http://localhost:3001/metrics

## 📖 Full Documentation

See [docs/](./docs/) directory for detailed documentation.

