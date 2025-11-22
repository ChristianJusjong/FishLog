#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  
  # Retry loop for migrations (max 30 seconds)
  MAX_RETRIES=6
  RETRY_COUNT=0
  
  until prisma migrate deploy; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "Migration failed after $MAX_RETRIES attempts, continuing anyway..."
      break
    fi
    echo "Migration failed, retrying in 5 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
  done
else
  echo "DATABASE_URL not set, skipping migrations..."
fi

echo "Starting application..."
exec node dist/index.js
