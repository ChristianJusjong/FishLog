#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy || echo "Migration failed, continuing anyway..."
else
  echo "DATABASE_URL not set, skipping migrations..."
fi

echo "Starting application..."
exec node dist/index.js
