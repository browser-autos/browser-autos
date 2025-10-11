# GitHub Container Registry (GHCR) Usage Guide

## Overview

**browser.autos** images are now available on GitHub Container Registry (GHCR), providing an alternative to Docker Hub with seamless GitHub integration.

## Available Images

### Docker Hub (Primary)
```bash
docker pull browserautos/browser-autos:latest
```

### GitHub Container Registry (Alternative)
```bash
docker pull ghcr.io/browser-autos/browser-autos:latest
```

---

## Quick Start

### 1. Pull from GHCR

```bash
# Latest version
docker pull ghcr.io/browser-autos/browser-autos:latest

# Specific version
docker pull ghcr.io/browser-autos/browser-autos:1.0.0

# Debian variant
docker pull ghcr.io/browser-autos/browser-autos:debian
```

### 2. Run the Container

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  ghcr.io/browser-autos/browser-autos:latest
```

### 3. Verify the Service

```bash
# Check health
curl http://localhost:3001/health

# Take a screenshot
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o screenshot.png
```

---

## Using GHCR in Docker Compose

### docker-compose.yml

```yaml
version: '3.8'

services:
  browser-autos:
    image: ghcr.io/browser-autos/browser-autos:latest
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=your-secret-key
      - REDIS_URL=redis://redis:6379
    shm_size: '2gb'
    mem_limit: 4g
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## Using GHCR in Kubernetes

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: browser-autos
spec:
  replicas: 3
  selector:
    matchLabels:
      app: browser-autos
  template:
    metadata:
      labels:
        app: browser-autos
    spec:
      containers:
      - name: browser-autos
        image: ghcr.io/browser-autos/browser-autos:latest
        ports:
        - containerPort: 3001
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: browser-autos-secret
              key: jwt-secret
        resources:
          limits:
            memory: "4Gi"
            cpu: "2000m"
          requests:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: dshm
          mountPath: /dev/shm
      volumes:
      - name: dshm
        emptyDir:
          medium: Memory
          sizeLimit: 2Gi
```

---

## Authentication for Private Access

While browser.autos images are public, if you need to authenticate with GHCR:

### Using Personal Access Token

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Login to GHCR:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Using in CI/CD

#### GitHub Actions

```yaml
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Pull image
  run: docker pull ghcr.io/browser-autos/browser-autos:latest
```

#### GitLab CI

```yaml
before_script:
  - echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
  - docker pull ghcr.io/browser-autos/browser-autos:latest
```

---

## Available Tags

| Tag | Description | Use Case |
|-----|-------------|----------|
| `latest` | Latest stable release | **Recommended for production** |
| `1.0.0` | Specific version | Version locking |
| `1.0` | Major.minor version | Patch updates only |
| `1` | Major version | Minor/patch updates |
| `debian` | Debian-based image | Stable, well-tested |

---

## Multi-Architecture Support

GHCR images support multiple architectures:

- **linux/amd64** - Intel/AMD 64-bit processors
- **linux/arm64** - ARM 64-bit (Apple Silicon, AWS Graviton)

Docker automatically pulls the correct architecture:

```bash
# On Apple Silicon Mac
docker pull ghcr.io/browser-autos/browser-autos:latest
# Pulls: linux/arm64

# On Intel/AMD Linux
docker pull ghcr.io/browser-autos/browser-autos:latest
# Pulls: linux/amd64
```

---

## Image Metadata

View image information:

```bash
# Inspect image
docker inspect ghcr.io/browser-autos/browser-autos:latest

# View labels
docker inspect ghcr.io/browser-autos/browser-autos:latest \
  | jq '.[0].Config.Labels'
```

Key labels:
- `org.opencontainers.image.title` - browser.autos
- `org.opencontainers.image.description` - Production-ready browser automation API
- `org.opencontainers.image.source` - https://github.com/browser-autos/browser-autos
- `org.opencontainers.image.version` - Version number

---

## Comparison: Docker Hub vs GHCR

| Feature | Docker Hub | GHCR |
|---------|-----------|------|
| **Image Name** | `browserautos/browser-autos` | `ghcr.io/browser-autos/browser-autos` |
| **Pull Speed** | ✅ Fast (global CDN) | ✅ Fast (GitHub CDN) |
| **Free Tier** | 200 pulls/6h | ✅ Unlimited public pulls |
| **GitHub Integration** | ❌ Manual sync | ✅ Native integration |
| **Anonymous Access** | ✅ Yes | ✅ Yes (public repos) |
| **Multi-arch** | ✅ AMD64, ARM64 | ✅ AMD64, ARM64 |
| **Recommended For** | General use | GitHub-centric workflows |

---

## Troubleshooting

### Rate Limiting

If you encounter rate limits with Docker Hub, switch to GHCR:

```bash
# Docker Hub (rate limited)
docker pull browserautos/browser-autos:latest

# GHCR (unlimited for public images)
docker pull ghcr.io/browser-autos/browser-autos:latest
```

### Authentication Issues

If you see "authentication required":

```bash
# Ensure you're pulling from the correct registry
docker pull ghcr.io/browser-autos/browser-autos:latest

# If private, login first
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Image Not Found

Verify the image name:

```bash
# ✅ Correct
ghcr.io/browser-autos/browser-autos:latest

# ❌ Wrong
ghcr.io/browserautos/browser-autos:latest  # This is Docker Hub naming
```

---

## Migration from Docker Hub

To migrate from Docker Hub to GHCR:

### 1. Update Image References

**Before:**
```yaml
image: browserautos/browser-autos:latest
```

**After:**
```yaml
image: ghcr.io/browser-autos/browser-autos:latest
```

### 2. Update Pull Commands

**Before:**
```bash
docker pull browserautos/browser-autos:latest
```

**After:**
```bash
docker pull ghcr.io/browser-autos/browser-autos:latest
```

### 3. Update CI/CD Pipelines

Replace Docker Hub login with GHCR login (if needed).

---

## Links

- **GHCR Repository**: https://github.com/orgs/browser-autos/packages/container/package/browser-autos
- **GitHub Source**: https://github.com/browser-autos/browser-autos
- **Docker Hub** (alternative): https://hub.docker.com/r/browserautos/browser-autos
- **Documentation**: https://github.com/browser-autos/browser-autos/tree/main/docs

---

## Support

For issues or questions:
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/browser-autos/browser-autos/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/browser-autos/browser-autos/discussions)
- 📖 **Documentation**: [Main README](https://github.com/browser-autos/browser-autos)

---

**Updated:** 2025-10-11
**Version:** 1.0.0
