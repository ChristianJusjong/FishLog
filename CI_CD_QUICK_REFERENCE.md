# CI/CD Quick Reference Guide

## 🚀 Quick Start

### Initial Setup (One-time)

1. **Set GitHub Secrets** (Settings → Secrets → Actions)
   ```
   STAGING_SSH_KEY
   STAGING_HOST
   STAGING_USER
   STAGING_DATABASE_URL
   PRODUCTION_SSH_KEY
   PRODUCTION_HOST
   PRODUCTION_USER
   PRODUCTION_DATABASE_URL
   EXPO_TOKEN (for mobile)
   SNYK_TOKEN (optional)
   ```

2. **Enable Dependabot**
   - Already configured in `.github/dependabot.yml`
   - Will run automatically every Monday

3. **Enable Branch Protection**
   - Settings → Branches → Add rule for `main`
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution

## 📋 Workflow Overview

### Automatic Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI Pipeline | Push/PR to main/develop | Tests, builds, security |
| CD Pipeline | Push to main, tags | Deploys to staging/prod |
| Security Scan | Daily 2 AM UTC | Security checks |
| Dependency Updates | Weekly Mon 9 AM | Update packages |
| Pull Request Checks | PR opened/updated | PR validation |

### Manual Triggers

Run workflows manually from: **Actions → Select workflow → Run workflow**

## 🔄 Common Workflows

### 1. Making Changes

```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/your-feature
```

**What happens automatically:**
- ✅ CI runs tests and security scans
- ✅ PR checks validate title format
- ✅ Code quality checks run
- ✅ Auto-labels based on files changed
- ✅ Review checklist posted

### 2. Deploying to Staging

```bash
# Merge to develop branch
git checkout develop
git merge feat/your-feature
git push origin develop
```

**What happens automatically:**
- ✅ CI pipeline runs
- ✅ Docker image builds
- ✅ Deploys to staging environment
- ✅ Runs database migrations
- ✅ Health check performed

### 3. Deploying to Production

**Option A: Via main branch**
```bash
git checkout main
git merge develop
git push origin main
```

**Option B: Via release tag (recommended)**
```bash
# Update version in package.json files first
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

**What happens automatically:**
- ✅ Full CI pipeline
- ✅ Docker image builds and tags
- ✅ Deploys to production
- ✅ Runs database migrations
- ✅ Mobile app publishes to Expo
- ✅ Health check performed

### 4. Handling Dependency Updates

**Weekly Automated Updates:**
- PR created every Monday
- Review → Approve → Merge

**Security Updates:**
- High priority PRs created automatically
- Review immediately
- Merge ASAP

**Manual Update:**
```bash
# Trigger manually from Actions tab
Actions → "Automated Dependency Updates" → Run workflow
```

## 🔒 Security Features

### Active Scanners

| Scanner | Type | Frequency |
|---------|------|-----------|
| Trivy | Vulnerabilities | Every push + daily |
| CodeQL | Code analysis | Every push |
| Semgrep | SAST | Every push |
| Snyk | Dependencies | Every push |
| Gitleaks | Secrets | Every push |
| npm audit | Dependencies | Every push |
| OWASP DC | Dependencies | Every push |

### Viewing Security Alerts

1. **Code Scanning**: Security tab → Code scanning
2. **Dependabot**: Security tab → Dependabot alerts
3. **Workflow Results**: Actions tab → Select run

## 📦 Package Updates

### Automated Update Cycle

```
Monday 9 AM UTC
    ↓
Scan for updates
    ↓
Run npm update
    ↓
Run tests
    ↓
Create PR (if updates found)
    ↓
Review & Merge
    ↓
Triggers deployment
```

### What Gets Updated

- ✅ npm dependencies (all workspaces)
- ✅ Docker base images
- ✅ GitHub Actions
- ✅ Security patches

### Update Grouping (Dependabot)

| Group | Packages |
|-------|----------|
| Fastify | @fastify/* |
| Prisma | @prisma/*, prisma |
| Expo | expo, expo-* |
| React Native | react-native, react-native-* |

## 🐛 Troubleshooting

### CI Fails

```bash
# Check logs
Actions → Failed workflow → View details

# Common issues:
- Type errors: Fix TypeScript errors
- Test failures: Update tests
- Lint errors: Run `npm run lint --fix`
- Security alerts: Update vulnerable packages
```

### Deployment Fails

```bash
# Check deployment logs
Actions → CD Pipeline → View logs

# Common issues:
- SSH key invalid: Update GitHub secret
- Database connection: Verify DATABASE_URL
- Port conflicts: Check server ports
- Permission denied: Check SSH user permissions
```

### Dependency Update Fails

```bash
# Test locally
npm update
npm run build
npm run dev

# If conflicts:
npm ci  # Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Best Practices

### Commit Messages

Use semantic commit format:
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
perf: improve performance
test: add tests
build: update build system
ci: update CI configuration
chore: maintenance tasks
```

### PR Guidelines

- ✅ Keep PRs small (<500 lines preferred)
- ✅ Include description and context
- ✅ Link related issues
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Check all CI passes before requesting review

### Security

- ✅ Never commit secrets (.env files)
- ✅ Review security alerts immediately
- ✅ Update dependencies weekly
- ✅ Test security patches in staging first
- ✅ Rotate credentials regularly

### Releases

1. Update CHANGELOG.md
2. Bump version in package.json
3. Create git tag
4. Push tag
5. Monitor deployment
6. Verify health checks

## 📊 Monitoring

### Health Check URLs

- **Staging**: `https://staging.fishlog.app/health`
- **Production**: `https://fishlog.app/health`

### CI/CD Status

Check status badges on README:
- ✅ Green: All good
- ⚠️ Yellow: In progress
- ❌ Red: Failed (investigate)

### Security Dashboard

- **GitHub Security Tab**: All security alerts
- **Actions Tab**: Workflow status
- **Dependabot Tab**: Dependency alerts

## 🆘 Emergency Procedures

### Rollback Production

```bash
# Find previous version
docker images ghcr.io/USERNAME/fishlog/backend

# Rollback
docker stop fishlog-backend
docker rm fishlog-backend
docker run -d [OPTIONS] ghcr.io/USERNAME/fishlog/backend:v1.0.0
```

### Disable Workflows (Emergency)

```bash
# GitHub UI
Settings → Actions → Disable Actions

# Or disable specific workflow
.github/workflows/[workflow].yml → Add:
# on: []  # Disable all triggers
```

### Security Incident

1. Check SECURITY.md
2. Contain threat immediately
3. Notify team
4. Apply fixes
5. Document incident

## 📚 Additional Resources

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **Security**: See `SECURITY.md`
- **Project Info**: See `README.md`
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Dependabot**: [docs.github.com/dependabot](https://docs.github.com/code-security/dependabot)

## ⚡ Quick Commands

```bash
# Check outdated packages
npm outdated

# Security audit
npm audit

# Fix security issues
npm audit fix

# Update specific package
npm update package-name

# Build all
npm run build

# Run locally
npm run dev

# Check Docker
docker ps
docker logs fishlog-backend
```

## 📝 Checklists

### Before Merging PR
- [ ] All CI checks pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console.log statements
- [ ] Security reviewed

### Before Production Deploy
- [ ] Tested in staging
- [ ] Database migrations tested
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring ready
- [ ] Health check working

### Weekly Maintenance
- [ ] Review dependency updates
- [ ] Check security alerts
- [ ] Review failed workflows
- [ ] Update documentation
- [ ] Rotate secrets (monthly)

---

**Need Help?** Check detailed guides or create an issue in the repository.
