#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Syncing database schema..."

  # Use db push to sync schema (more reliable than migrations for schema drift)
  MAX_RETRIES=6
  RETRY_COUNT=0

  until prisma db push --skip-generate --accept-data-loss; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "Schema sync failed after $MAX_RETRIES attempts, continuing anyway..."
      break
    fi
    echo "Schema sync failed, retrying in 5 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
  done
else
  echo "DATABASE_URL not set, skipping schema sync..."
fi

echo "Starting application..."
exec node dist/index.js
