#!/bin/bash
# Google Cloud Platform Setup Script for FishLog
# This script sets up all necessary GCP resources for running FishLog

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FishLog GCP Setup ===${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Variables (customize these)
read -p "Enter your GCP Project ID: " PROJECT_ID
read -p "Enter region (default: us-central1): " REGION
REGION=${REGION:-us-central1}
read -p "Enter database password: " -s DB_PASSWORD
echo

# Set default project
echo -e "${YELLOW}Setting default project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com \
  compute.googleapis.com

# Create Cloud SQL instance (PostgreSQL with PostGIS)
echo -e "${YELLOW}Creating Cloud SQL instance (this may take 5-10 minutes)...${NC}"
gcloud sql instances create fishlog-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=$DB_PASSWORD \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --database-flags=cloudsql.enable_pgaudit=on || echo "Instance might already exist"

# Create database
echo -e "${YELLOW}Creating database...${NC}"
gcloud sql databases create fishlog \
  --instance=fishlog-db || echo "Database might already exist"

# Create database user
echo -e "${YELLOW}Creating database user...${NC}"
gcloud sql users create fishlog \
  --instance=fishlog-db \
  --password=$DB_PASSWORD || echo "User might already exist"

# Get the Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe fishlog-db --format='value(connectionName)')
echo -e "${GREEN}Cloud SQL Connection Name: $CONNECTION_NAME${NC}"

# Create DATABASE_URL
DATABASE_URL="postgresql://fishlog:$DB_PASSWORD@localhost/fishlog?host=/cloudsql/$CONNECTION_NAME"

# Create secrets in Secret Manager
echo -e "${YELLOW}Creating secrets in Secret Manager...${NC}"

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy="automatic" || \
  echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-

# Database URL
echo -n "$DATABASE_URL" | gcloud secrets create database-url \
  --data-file=- \
  --replication-policy="automatic" || \
  echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=-

# Prompt for Google OAuth credentials
echo -e "${YELLOW}Google OAuth Setup (optional - press Enter to skip):${NC}"
read -p "Enter Google Client ID (or press Enter to skip): " GOOGLE_CLIENT_ID
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
  echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id \
    --data-file=- \
    --replication-policy="automatic" || \
    echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets versions add google-client-id --data-file=-

  read -p "Enter Google Client Secret: " -s GOOGLE_CLIENT_SECRET
  echo
  echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret \
    --data-file=- \
    --replication-policy="automatic" || \
    echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets versions add google-client-secret --data-file=-
fi

# Grant Cloud Run access to secrets
echo -e "${YELLOW}Configuring IAM permissions...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
  gcloud secrets add-iam-policy-binding google-client-id \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

  gcloud secrets add-iam-policy-binding google-client-secret \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
fi

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudsql.client"

# Create Cloud Build trigger (optional)
echo -e "${YELLOW}Would you like to set up automated deployments from GitHub? (y/n)${NC}"
read -p "> " SETUP_TRIGGER

if [ "$SETUP_TRIGGER" = "y" ]; then
  echo -e "${YELLOW}Connect your GitHub repository at:${NC}"
  echo "https://console.cloud.google.com/cloud-build/triggers/connect?project=$PROJECT_ID"
  echo ""
  echo "Then run this command to create the trigger:"
  echo "gcloud builds triggers create github \\"
  echo "  --repo-name=YOUR_REPO_NAME \\"
  echo "  --repo-owner=YOUR_GITHUB_USERNAME \\"
  echo "  --branch-pattern='^main$' \\"
  echo "  --build-config=cloudbuild.yaml \\"
  echo "  --substitutions=_REGION=$REGION"
fi

# Print summary
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${GREEN}Cloud SQL Instance:${NC} fishlog-db"
echo -e "${GREEN}Connection Name:${NC} $CONNECTION_NAME"
echo -e "${GREEN}Region:${NC} $REGION"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Build and deploy your application:"
echo "   ./gcp-deploy.sh"
echo ""
echo "2. Or use Cloud Build from your GitHub repo"
echo ""
echo "3. View your deployed app at:"
echo "   https://console.cloud.google.com/run?project=$PROJECT_ID"
echo ""
echo -e "${GREEN}Important:${NC} Save your database password securely!"
echo ""
