# FishLog - Google Cloud Platform Deployment Guide

This guide will help you deploy FishLog to Google Cloud Platform (GCP) with Cloud Run and Cloud SQL.

## Overview

**Architecture:**
- **Backend**: Google Cloud Run (serverless container platform)
- **Database**: Cloud SQL for PostgreSQL with PostGIS
- **Storage**: Google Cloud Storage (for images)
- **Build**: Cloud Build (CI/CD)
- **Secrets**: Secret Manager

**Estimated Monthly Cost:**
- Small usage (free tier): **$0-10/month**
- Medium usage: **$20-50/month**
- Production scale: **$100+/month**

## Prerequisites

1. **Google Cloud Account**
   - Sign up at https://cloud.google.com/
   - New users get $300 free credit for 90 days

2. **Install Google Cloud CLI**
   ```bash
   # Windows (with Chocolatey)
   choco install gcloudsdk

   # Or download installer from:
   # https://cloud.google.com/sdk/docs/install
   ```

3. **Install Docker**
   - Already installed on your system

4. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

## Step-by-Step Deployment

### Step 1: Create a GCP Project

```bash
# Create a new project
gcloud projects create YOUR-PROJECT-ID --name="FishLog"

# Set as default project
gcloud config set project YOUR-PROJECT-ID

# Link billing account (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### Step 2: Run Setup Script

The setup script will create all necessary resources:

```bash
# Make scripts executable (Git Bash on Windows)
chmod +x gcp-setup.sh gcp-deploy.sh

# Run setup
./gcp-setup.sh
```

**What the setup script does:**
1. Enables required GCP APIs
2. Creates Cloud SQL PostgreSQL instance with PostGIS
3. Creates database and user
4. Generates and stores secrets (JWT, database credentials)
5. Configures IAM permissions
6. Sets up Cloud Build trigger (optional)

**You'll be prompted for:**
- GCP Project ID
- Region (default: us-central1)
- Database password
- Google OAuth credentials (optional)

### Step 3: Deploy the Backend

```bash
# Deploy to Cloud Run
./gcp-deploy.sh
```

**What the deploy script does:**
1. Builds Docker image
2. Pushes to Google Container Registry
3. Deploys to Cloud Run
4. Runs database migrations
5. Performs health check

**After deployment, you'll receive:**
- Service URL (e.g., https://fishlog-backend-xxxxx-uc.a.run.app)
- Commands for viewing logs and managing service

### Step 4: Configure Mobile App

Update the API URL in your mobile app:

```bash
# Edit apps/mobile/app/index.tsx or create .env file
EXPO_PUBLIC_API_URL=https://your-service-url.run.app
```

### Step 5: Test the Deployment

```bash
# Test health endpoint
curl https://your-service-url.run.app/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected","version":"1.0.0"}
```

## Automated Deployments (CI/CD)

### Option A: Cloud Build from GitHub

1. **Connect GitHub Repository**
   ```bash
   # Go to Cloud Build console
   open https://console.cloud.google.com/cloud-build/triggers/connect?project=YOUR-PROJECT-ID
   ```

2. **Create Build Trigger**
   - Repository: Your GitHub repo
   - Branch: `main`
   - Configuration: `cloudbuild.yaml`
   - Substitutions:
     - `_REGION`: `us-central1`
     - `_DATABASE_URL`: (leave empty, will use secrets)

3. **Push to Deploy**
   ```bash
   git push origin main
   # Your app will automatically deploy!
   ```

### Option B: GitHub Actions

The project already includes GitHub Actions workflows. Add these secrets to your GitHub repo:

**GitHub Secrets (Settings → Secrets and variables → Actions):**
```
GCP_PROJECT_ID          # Your GCP project ID
GCP_SA_KEY              # Service account JSON key
GCP_REGION              # us-central1
DATABASE_URL            # PostgreSQL connection string
JWT_SECRET              # Random secret key
```

**Create Service Account for GitHub Actions:**
```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Generate key (download JSON)
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com

# Copy the entire content of key.json to GitHub secret GCP_SA_KEY
```

## Database Management

### Access Cloud SQL

**Option 1: Cloud SQL Proxy (Recommended)**
```bash
# Download proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.windows.amd64.exe

# Run proxy
./cloud-sql-proxy YOUR-PROJECT:REGION:fishlog-db

# Connect with psql
psql "postgresql://fishlog:PASSWORD@localhost:5432/fishlog"
```

**Option 2: Prisma Studio**
```bash
cd apps/backend

# Set DATABASE_URL to Cloud SQL
export DATABASE_URL="postgresql://fishlog:PASSWORD@localhost/fishlog?host=/cloudsql/PROJECT:REGION:INSTANCE"

# Run Prisma Studio
npm run db:studio
```

### Run Migrations

```bash
# Locally (with Cloud SQL Proxy running)
cd apps/backend
npx prisma migrate deploy

# Or let the deploy script handle it automatically
./gcp-deploy.sh
```

### Backup Database

Cloud SQL automatically creates daily backups. To create manual backup:

```bash
gcloud sql backups create --instance=fishlog-db

# List backups
gcloud sql backups list --instance=fishlog-db

# Restore from backup
gcloud sql backups restore BACKUP_ID --backup-instance=fishlog-db
```

## Monitoring & Debugging

### View Logs

```bash
# Recent logs
gcloud run services logs read fishlog-backend --region=us-central1 --limit=50

# Follow logs in real-time
gcloud run services logs tail fishlog-backend --region=us-central1

# View in Console
open https://console.cloud.google.com/logs/query?project=YOUR-PROJECT-ID
```

### Performance Monitoring

```bash
# Cloud Run metrics
open https://console.cloud.google.com/run/detail/us-central1/fishlog-backend/metrics?project=YOUR-PROJECT-ID

# SQL Performance
open https://console.cloud.google.com/sql/instances/fishlog-db/monitoring?project=YOUR-PROJECT-ID
```

### Common Issues

**1. "Permission denied" errors**
```bash
# Check IAM permissions
gcloud projects get-iam-policy YOUR-PROJECT-ID

# Grant Cloud SQL client role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT" \
  --role="roles/cloudsql.client"
```

**2. Database connection timeout**
```bash
# Verify Cloud SQL instance is running
gcloud sql instances describe fishlog-db

# Check connection
gcloud sql connect fishlog-db --user=fishlog
```

**3. Container fails to start**
```bash
# Check logs
gcloud run services logs read fishlog-backend --region=us-central1

# Common fixes:
# - Verify DATABASE_URL secret is correct
# - Check JWT_SECRET is set
# - Ensure migrations were run
```

## Scaling & Performance

### Adjust Cloud Run Settings

```bash
# Update service configuration
gcloud run services update fishlog-backend \
  --region=us-central1 \
  --memory=1Gi \
  --cpu=2 \
  --max-instances=20 \
  --min-instances=1 \
  --concurrency=80
```

### Scale Cloud SQL

```bash
# Upgrade instance tier
gcloud sql instances patch fishlog-db \
  --tier=db-custom-2-4096

# Enable automatic storage increase
gcloud sql instances patch fishlog-db \
  --storage-auto-increase
```

## Cost Optimization

### Cloud Run Tips
- **Min instances = 0**: Scales to zero when not in use (saves costs)
- **Min instances = 1**: Always-on, faster response (costs ~$10/month)
- **Memory**: Start with 512Mi, only increase if needed
- **CPU**: Start with 1 CPU, only increase for heavy workloads

### Cloud SQL Tips
- **Tier**: Start with `db-f1-micro` (free tier eligible)
- **Upgrade to**: `db-g1-small` for production (~$25/month)
- **Backups**: Default (7 days) is usually sufficient
- **High Availability**: Only enable if you need 99.95% uptime (+100% cost)

### Estimated Costs

**Development/Small Production:**
```
Cloud Run (minimal usage):        $0-5/month
Cloud SQL (db-f1-micro):          $0-10/month
Cloud Storage (1GB):              $0.02/month
Cloud Build (free tier):          $0/month
--------------------------------
Total:                            $0-15/month
```

**Medium Production:**
```
Cloud Run (moderate traffic):     $10-20/month
Cloud SQL (db-g1-small):          $25/month
Cloud Storage (5GB + transfers):  $1/month
Secret Manager:                   $0.06/month
--------------------------------
Total:                            $36-46/month
```

## Security Best Practices

1. **Use Secret Manager** for sensitive data (already configured)
2. **Enable Cloud Armor** for DDoS protection (optional)
3. **Set up Cloud IAM** with least privilege principle
4. **Enable audit logging** in Cloud Logging
5. **Regular security scans** with Cloud Security Command Center
6. **Keep dependencies updated** (automated with Dependabot)

## Cleanup / Teardown

To delete all resources and stop billing:

```bash
# Delete Cloud Run service
gcloud run services delete fishlog-backend --region=us-central1

# Delete Cloud SQL instance
gcloud sql instances delete fishlog-db

# Delete secrets
gcloud secrets delete jwt-secret
gcloud secrets delete database-url
gcloud secrets delete google-client-id
gcloud secrets delete google-client-secret

# Delete container images
gcloud container images list
gcloud container images delete gcr.io/YOUR-PROJECT-ID/fishlog-backend --quiet

# Delete entire project (if you want)
gcloud projects delete YOUR-PROJECT-ID
```

## Next Steps

1. **Set up custom domain**
   - Map your domain to Cloud Run
   - Configure SSL certificate (automatic with Cloud Run)

2. **Enable Cloud CDN**
   - Cache static assets
   - Reduce latency globally

3. **Set up monitoring alerts**
   - Email/SMS alerts for downtime
   - Budget alerts for cost overruns

4. **Deploy mobile app to app stores**
   - Use EAS Build for iOS/Android
   - Configure production API URL

## Useful Links

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Build](https://cloud.google.com/build/docs)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
- [GCP Free Tier](https://cloud.google.com/free)

## Support

For issues or questions:
1. Check the logs first: `gcloud run services logs read fishlog-backend`
2. Review the [troubleshooting section](#monitoring--debugging)
3. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-run)
4. Open an issue on GitHub
