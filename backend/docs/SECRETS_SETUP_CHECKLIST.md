# GitHub Secrets Setup Checklist

## 🎯 Quick Setup Guide

Follow these steps to configure GitHub Actions for Docker publishing.

---

## ✅ Checklist

### Step 1: Docker Hub Access Token

- [ ] Login to Docker Hub: https://hub.docker.com
- [ ] Navigate to: Account Settings → Security
- [ ] Click: "New Access Token"
- [ ] Set Description: `github-actions-browser-autos`
- [ ] Set Permissions: **Read, Write, Delete**
- [ ] Click: "Generate"
- [ ] **Copy the token immediately** (it only shows once!)

**Token format:** `dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 2: Add Secrets to GitHub

Visit: https://github.com/browser-autos/browser-autos/settings/secrets/actions

#### Secret 1: DOCKERHUB_USERNAME

- [ ] Click: "New repository secret"
- [ ] Name: `DOCKERHUB_USERNAME`
- [ ] Value: `browserautos`
- [ ] Click: "Add secret"

#### Secret 2: DOCKERHUB_TOKEN

- [ ] Click: "New repository secret"
- [ ] Name: `DOCKERHUB_TOKEN`
- [ ] Value: *[Paste your Docker Hub token]*
- [ ] Click: "Add secret"

---

### Step 3: Verify Workflow Permissions

Visit: https://github.com/browser-autos/browser-autos/settings/actions

- [ ] Navigate to: **General** → **Workflow permissions**
- [ ] Select: ✅ **Read and write permissions**
- [ ] Click: "Save"

This allows the workflow to:
- Push images to GitHub Container Registry (GHCR)
- Update package metadata

---

### Step 4: Verify Secrets

Visit: https://github.com/browser-autos/browser-autos/settings/secrets/actions

You should see:
- ✅ `DOCKERHUB_USERNAME` (Updated X seconds ago)
- ✅ `DOCKERHUB_TOKEN` (Updated X seconds ago)

**Note:** You cannot view secret values after creation, but you can see when they were last updated.

---

## 🔄 Retrigger Failed Workflow

After configuring secrets, retrigger the workflow:

### Option 1: Re-run Failed Jobs (Recommended)

1. Visit: https://github.com/browser-autos/browser-autos/actions
2. Click on the failed workflow run (marked with ❌)
3. Click: "Re-run jobs" → "Re-run failed jobs"

### Option 2: Re-push Tag

```bash
# Delete remote tag
git push --delete origin v1.0.0

# Delete local tag
git tag -d v1.0.0

# Re-create and push
git tag v1.0.0
git push origin v1.0.0
```

---

## ✅ Success Indicators

When secrets are configured correctly, the workflow should show:

```
✅ Checkout code
✅ Set up QEMU
✅ Set up Docker Buildx
✅ Login to Docker Hub              ← Should succeed now!
✅ Login to GitHub Container Registry
✅ Extract metadata (tags, labels)
✅ Build and push Docker image
✅ Update Docker Hub README
✅ Summary
```

---

## 🐛 Troubleshooting

### Error: "Username and password required"

**Cause:** Missing or incorrect Docker Hub secrets

**Solution:**
1. Verify `DOCKERHUB_USERNAME` exists and equals `browserautos`
2. Verify `DOCKERHUB_TOKEN` exists and is a valid Docker Hub Personal Access Token
3. Re-create token if necessary

### Error: "denied: requested access to the resource is denied"

**Cause:** Token permissions insufficient or expired

**Solution:**
1. Delete old token from Docker Hub
2. Create new token with **Read, Write, Delete** permissions
3. Update `DOCKERHUB_TOKEN` secret in GitHub

### Error: "Error: GITHUB_TOKEN permissions"

**Cause:** Insufficient workflow permissions for GHCR

**Solution:**
1. Settings → Actions → General → Workflow permissions
2. Select: **Read and write permissions**
3. Save changes

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Create Docker Hub Token                     │
│    hub.docker.com/settings/security             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. Add GitHub Secrets                           │
│    - DOCKERHUB_USERNAME = browserautos          │
│    - DOCKERHUB_TOKEN = dckr_pat_xxx...          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. Set Workflow Permissions                     │
│    ✓ Read and write permissions                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 4. Retrigger Workflow                           │
│    Actions → Re-run failed jobs                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ ✅ Workflow Success                             │
│    - Images pushed to Docker Hub                │
│    - Images pushed to GHCR                      │
│    - Package page created                       │
└─────────────────────────────────────────────────┘
```

---

## 📝 Notes

- **Token Security:** Never commit tokens to Git or share them publicly
- **Token Rotation:** Rotate tokens periodically for security
- **Token Scope:** Use minimal required permissions (Read, Write, Delete for Docker Hub)
- **GITHUB_TOKEN:** Automatically provided by GitHub Actions, no manual setup needed

---

## 🔗 Quick Links

- **GitHub Secrets:** https://github.com/browser-autos/browser-autos/settings/secrets/actions
- **Workflow Permissions:** https://github.com/browser-autos/browser-autos/settings/actions
- **Actions Page:** https://github.com/browser-autos/browser-autos/actions
- **Docker Hub Security:** https://hub.docker.com/settings/security

---

**Last Updated:** 2025-10-11
