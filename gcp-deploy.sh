#!/bin/bash
# Deploy FishLog to Google Cloud Run
# This script builds and deploys the backend to Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FishLog GCP Deployment ===${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: No GCP project set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

# Variables
REGION=${REGION:-us-central1}
SERVICE_NAME="fishlog-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${YELLOW}Project ID: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -f apps/backend/Dockerfile -t $IMAGE_NAME:latest .

# Tag with commit hash if in git repo
if git rev-parse --git-dir > /dev/null 2>&1; then
    COMMIT_SHA=$(git rev-parse --short HEAD)
    docker tag $IMAGE_NAME:latest $IMAGE_NAME:$COMMIT_SHA
    echo -e "${GREEN}Tagged image with commit: $COMMIT_SHA${NC}"
fi

# Configure Docker to use gcloud as credential helper
echo -e "${YELLOW}Configuring Docker authentication...${NC}"
gcloud auth configure-docker --quiet

# Push to Google Container Registry
echo -e "${YELLOW}Pushing image to GCR...${NC}"
docker push $IMAGE_NAME:latest

if [ ! -z "$COMMIT_SHA" ]; then
    docker push $IMAGE_NAME:$COMMIT_SHA
fi

# Get database connection name
echo -e "${YELLOW}Getting Cloud SQL connection name...${NC}"
CONNECTION_NAME=$(gcloud sql instances describe fishlog-db --format='value(connectionName)' 2>/dev/null || echo "")

if [ -z "$CONNECTION_NAME" ]; then
    echo -e "${RED}Warning: Cloud SQL instance 'fishlog-db' not found${NC}"
    echo "Run ./gcp-setup.sh first to create the database"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME:latest \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest \
  --add-cloudsql-instances=$CONNECTION_NAME \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --min-instances=0 \
  --port=3000

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform=managed --region=$REGION --format='value(status.url)')

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)

# Create a temporary container to run migrations
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  $IMAGE_NAME:latest \
  sh -c "npx prisma migrate deploy" || echo -e "${YELLOW}Warning: Migration failed or no migrations to run${NC}"

# Health check
echo -e "${YELLOW}Performing health check...${NC}"
sleep 5
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_STATUS)${NC}"
    echo "Check logs: gcloud run services logs read $SERVICE_NAME --region=$REGION"
fi

# Print summary
echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo -e "${GREEN}Service URL:${NC} $SERVICE_URL"
echo -e "${GREEN}API Health:${NC} $SERVICE_URL/health"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:    gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50"
echo "  Describe:     gcloud run services describe $SERVICE_NAME --region=$REGION"
echo "  Delete:       gcloud run services delete $SERVICE_NAME --region=$REGION"
echo ""
echo -e "${YELLOW}Update mobile app API URL:${NC}"
echo "  Edit apps/mobile/app/index.tsx and set API_URL to: $SERVICE_URL"
echo ""
