# GitHub Actions Setup Checklist

## ✅ Required Secrets

Navigate to: `Settings` → `Secrets and variables` → `Actions`

### Docker Hub Secrets

1. **DOCKERHUB_USERNAME**
   - Value: Your Docker Hub username (e.g., `browserautos`)
   - Used for: Docker Hub login and push

2. **DOCKERHUB_TOKEN**
   - Value: Docker Hub Personal Access Token
   - How to create:
     1. Login to Docker Hub
     2. Go to Account Settings → Security
     3. Click "New Access Token"
     4. Name: `github-actions-browser-autos`
     5. Permissions: Read, Write, Delete
     6. Copy the token and add to GitHub Secrets

### GitHub Token (Automatic)

- **GITHUB_TOKEN** - Automatically provided by GitHub Actions
- No need to create manually
- Used for GHCR authentication

---

## ✅ Workflow Permissions

Navigate to: `Settings` → `Actions` → `General` → `Workflow permissions`

**Required Setting:**

```
☑ Read and write permissions
```

This allows the workflow to:
- Push images to GitHub Container Registry
- Update package metadata
- Create release artifacts

---

## ✅ Verify Workflow Trigger

After pushing tag `v1.0.0`, verify the workflow started:

1. Go to: https://github.com/browser-autos/browser-autos/actions
2. Look for workflow: **"Publish Docker Images"**
3. Status should be: 🟡 Running or ✅ Success

---

## 🔍 Debugging Failed Builds

### Check Build Logs

1. Go to Actions page
2. Click on the failed workflow run
3. Click on "build-and-push" job
4. Expand each step to see detailed logs

### Common Issues

#### Issue 1: "requested access to the resource is denied"

**Cause:** Missing or incorrect Docker Hub credentials

**Solution:**
```bash
# Verify secrets are set correctly
Settings → Secrets → Actions → DOCKERHUB_USERNAME
Settings → Secrets → Actions → DOCKERHUB_TOKEN
```

#### Issue 2: "Error: docker build failed"

**Cause:** Dockerfile path or context issue

**Solution:** Verify workflow configuration:
```yaml
context: .
file: ./docker/Dockerfile
```

#### Issue 3: "Error: GITHUB_TOKEN permissions"

**Cause:** Insufficient workflow permissions

**Solution:**
```
Settings → Actions → General → Workflow permissions
☑ Read and write permissions
```

#### Issue 4: "Error: COPY failed: no source files were specified"

**Cause:** Directory structure mismatch

**Solution:** Ensure these files exist:
```
.
├── docker/
│   └── Dockerfile
├── src/
├── package.json
└── tsconfig.json
```

---

## 📦 After First Successful Build

Once the workflow completes successfully:

### 1. Verify Docker Hub

Visit: https://hub.docker.com/r/browserautos/chromium

You should see:
- Tags: `latest`, `1.0.0`, `1.0`, `1`, `debian`
- Platforms: `linux/amd64`, `linux/arm64`

### 2. Verify GitHub Container Registry

Visit: https://github.com/orgs/browser-autos/packages/container/package/browser-autos

You should see:
- Package name: `browser-autos`
- Tags: `latest`, `1.0.0`, `1.0`, `1`, `debian`
- Visibility: Public

### 3. Test Pull Commands

```bash
# From Docker Hub
docker pull browserautos/chromium:1.0.0

# From GHCR
docker pull ghcr.io/browser-autos/browser-autos:1.0.0

# Verify images
docker images | grep -E "browserautos|browser-autos"
```

### 4. Test Run

```bash
docker run --rm \
  -p 3001:3001 \
  -e JWT_SECRET=test-secret \
  --shm-size=2gb \
  ghcr.io/browser-autos/browser-autos:1.0.0

# In another terminal
curl http://localhost:3001/health
```

---

## 🚀 Future Releases

For subsequent releases, simply create and push a new tag:

```bash
# Create new version
git tag v1.0.1
git push origin v1.0.1

# Workflow will automatically:
# 1. Build multi-arch images
# 2. Push to Docker Hub
# 3. Push to GHCR
# 4. Update Docker Hub README
```

---

## 📊 Monitoring

### Build Time

Expected build times:
- Single architecture: ~8-12 minutes
- Multi-architecture: ~15-20 minutes

### Build Cache

The workflow uses GitHub Actions cache to speed up subsequent builds:
- First build: Full build (~15-20 min)
- Cached build: Faster (~5-10 min)

---

## 🔗 Useful Links

- **Actions Page**: https://github.com/browser-autos/browser-autos/actions
- **Workflow File**: `.github/workflows/docker-publish.yml`
- **Docker Hub**: https://hub.docker.com/r/browserautos/chromium
- **GHCR Package**: https://github.com/orgs/browser-autos/packages/container/package/browser-autos

---

## 💡 Tips

1. **Manual Workflow Trigger**: You can manually trigger the workflow from GitHub Actions UI
2. **Test Builds Locally**: Use `docker build` to test before pushing tags
3. **Version Strategy**: Use semantic versioning (e.g., v1.0.0, v1.1.0)
4. **Tag Naming**: Always prefix version tags with `v` (e.g., `v1.0.0`)

---

**Last Updated:** 2025-10-11
