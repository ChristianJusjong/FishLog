# FishLog - Deployment Guide

This guide covers the setup and configuration for continuous deployment with automated security scanning and package updates.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [GitHub Secrets Configuration](#github-secrets-configuration)
3. [CI/CD Pipeline Overview](#cicd-pipeline-overview)
4. [Security Scanning](#security-scanning)
5. [Automated Dependency Updates](#automated-dependency-updates)
6. [Deployment Workflow](#deployment-workflow)
7. [Docker Deployment](#docker-deployment)
8. [Environment Variables](#environment-variables)

## Prerequisites

- GitHub repository
- Docker Hub or GitHub Container Registry account
- Deployment server (VPS, cloud provider, etc.)
- PostgreSQL database (production)
- Node.js 18+ on deployment servers

## GitHub Secrets Configuration

Navigate to your repository: **Settings → Secrets and variables → Actions**

### Required Secrets

#### Staging Environment
```
STAGING_SSH_KEY          # SSH private key for staging server
STAGING_HOST             # Staging server hostname/IP
STAGING_USER             # SSH user for staging server
STAGING_DATABASE_URL     # PostgreSQL connection string for staging
```

#### Production Environment
```
PRODUCTION_SSH_KEY       # SSH private key for production server
PRODUCTION_HOST          # Production server hostname/IP
PRODUCTION_USER          # SSH user for production server
PRODUCTION_DATABASE_URL  # PostgreSQL connection string for production
```

#### Mobile App (Expo)
```
EXPO_TOKEN              # Expo access token (get from expo.dev)
```

#### Optional - Enhanced Security Scanning
```
SNYK_TOKEN              # Snyk API token (snyk.io)
```

### Setting Up SSH Keys

1. Generate SSH key pair:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key
   ```

2. Add public key to your server:
   ```bash
   ssh-copy-id -i deploy_key.pub user@your-server.com
   ```

3. Add private key to GitHub Secrets as `STAGING_SSH_KEY` or `PRODUCTION_SSH_KEY`

## CI/CD Pipeline Overview

### Workflows

#### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- Security scanning (Trivy, npm audit)
- Code linting
- Backend build and test with PostgreSQL
- Mobile build and type checking
- Dependency review (PR only)
- CodeQL security analysis

#### 2. **CD Pipeline** (`.github/workflows/cd.yml`)
Runs on:
- Push to `main` branch
- Version tags (`v*.*.*`)
- Manual workflow dispatch

**Jobs:**
- Build and push Docker images
- Deploy to staging (develop branch)
- Deploy to production (main branch/tags)
- Mobile app deployment (Expo)

#### 3. **Security Scanning** (`.github/workflows/security-scan.yml`)
Runs on:
- Push to main/develop
- Pull requests
- Daily at 2 AM UTC
- Manual dispatch

**Scanners:**
- Semgrep (SAST)
- Snyk (dependency vulnerabilities)
- Trivy (container scanning)
- Gitleaks (secrets detection)
- License compliance checker
- OWASP Dependency Check

#### 4. **Dependency Updates** (`.github/workflows/dependency-updates.yml`)
Runs weekly every Monday at 9 AM UTC.

**Features:**
- Automated npm package updates
- Security vulnerability fixes
- Automatic PR creation with test results

#### 5. **Dependabot** (`.github/dependabot.yml`)
- Weekly dependency updates
- Grouped updates for related packages
- Separate updates for backend, mobile, Docker, and GitHub Actions

## Security Scanning

### Enabled Security Tools

1. **Trivy** - Vulnerability scanning for dependencies and containers
2. **CodeQL** - Code analysis for security vulnerabilities
3. **Semgrep** - Static analysis security testing (SAST)
4. **Snyk** - Dependency and container vulnerability scanning
5. **Gitleaks** - Secret detection in git history
6. **npm audit** - Built-in npm vulnerability checker
7. **License checker** - Ensures compliance with allowed licenses

### Security Reports

Reports are available in:
- **GitHub Security** tab → Code scanning alerts
- **Actions** tab → Workflow artifacts
- Pull request comments (for dependency review)

## Automated Dependency Updates

### How It Works

1. **Weekly Updates**: Every Monday at 9 AM UTC
   - Scans for outdated packages
   - Updates to latest compatible versions
   - Runs tests
   - Creates PR if updates available

2. **Security Updates**: On-demand
   - Runs `npm audit fix`
   - Creates high-priority PR for security fixes
   - Labeled as `security` and `priority-high`

3. **Dependabot**: Weekly
   - Creates individual PRs for each dependency
   - Groups related packages (Fastify, Prisma, Expo, etc.)
   - Includes release notes and changelog

### Managing Update PRs

1. Review the PR description
2. Check the CI pipeline results
3. Test locally if needed:
   ```bash
   git fetch origin
   git checkout automated-dependency-updates
   npm install
   npm run build
   npm run dev
   ```
4. Merge when tests pass

## Deployment Workflow

### Staging Deployment

Automatically deploys when:
- Code is pushed to `develop` branch
- Manual trigger with `staging` environment selected

### Production Deployment

Automatically deploys when:
- Code is pushed to `main` branch
- Version tag is created (e.g., `v1.0.0`)
- Manual trigger with `production` environment selected

### Creating a Release

1. Update version in package.json files
2. Create and push a git tag:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
3. Deployment will trigger automatically

## Docker Deployment

### Building the Backend Image

```bash
# Build
docker build -f apps/backend/Dockerfile -t fishlog-backend:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/fishlog" \
  -e JWT_SECRET="your-secret" \
  fishlog-backend:latest
```

### Using Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/your-username/fishlog/backend:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgis/postgis:16-3.4
    environment:
      - POSTGRES_USER=fishlog
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=fishlog
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fishlog"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3000
NODE_ENV=production
```

### Mobile App

Update `apps/mobile/app.config.js`:

```javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
    },
  },
};
```

## Deployment Scripts

### Backend Deployment Script

Create `scripts/deploy-backend.sh`:

```bash
#!/bin/bash
set -e

echo "Deploying FishLog Backend..."

# Pull latest image
docker pull ghcr.io/your-username/fishlog/backend:latest

# Stop existing container
docker stop fishlog-backend || true
docker rm fishlog-backend || true

# Run migrations
docker run --rm \
  --network host \
  -e DATABASE_URL="$DATABASE_URL" \
  ghcr.io/your-username/fishlog/backend:latest \
  npx prisma migrate deploy

# Start new container
docker run -d \
  --name fishlog-backend \
  --network host \
  -e DATABASE_URL="$DATABASE_URL" \
  -e JWT_SECRET="$JWT_SECRET" \
  --restart unless-stopped \
  ghcr.io/your-username/fishlog/backend:latest

echo "Deployment complete!"

# Health check
sleep 5
curl -f http://localhost:3000/health || exit 1
echo "Health check passed!"
```

## Rollback Procedure

### Rolling Back a Deployment

1. **Identify previous version**:
   ```bash
   docker images ghcr.io/your-username/fishlog/backend
   ```

2. **Rollback to specific version**:
   ```bash
   docker stop fishlog-backend
   docker rm fishlog-backend
   docker run -d \
     --name fishlog-backend \
     [same options as above] \
     ghcr.io/your-username/fishlog/backend:v1.0.0
   ```

3. **Rollback database** (if needed):
   ```bash
   cd apps/backend
   npx prisma migrate resolve --rolled-back migration_name
   ```

## Monitoring and Health Checks

### Health Check Endpoints

- **Backend**: `GET /health`
  ```json
  {
    "status": "healthy",
    "database": "connected"
  }
  ```

### Monitoring Setup

1. **Uptime monitoring**: Use services like UptimeRobot or Better Uptime
2. **Application monitoring**: Consider Sentry, DataDog, or New Relic
3. **Log aggregation**: Use Loki, ELK stack, or cloud provider logs

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check GitHub Actions logs
2. **Database connection errors**: Verify DATABASE_URL secret
3. **Docker image build fails**: Check Dockerfile and dependencies
4. **Security scan failures**: Review security alerts and update dependencies

### Getting Help

- Check workflow logs in GitHub Actions
- Review security alerts in GitHub Security tab
- Verify all secrets are correctly set
- Test deployment scripts locally first

## Best Practices

1. **Always test in staging first** before production
2. **Review dependency updates** before merging
3. **Monitor security alerts** regularly
4. **Keep secrets rotated** periodically
5. **Document any custom changes** to workflows
6. **Use semantic versioning** for releases
7. **Enable branch protection** for main/develop branches
8. **Require PR reviews** before merging to main

## Next Steps

1. Set up all required GitHub Secrets
2. Push code to trigger first CI run
3. Verify all workflows pass
4. Set up production infrastructure
5. Configure deployment scripts for your environment
6. Enable GitHub branch protection rules
7. Set up monitoring and alerting
8. Document team-specific deployment procedures
