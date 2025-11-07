#!/bin/bash
# Script to apply pending Prisma migrations
# Run this in Railway console: bash apply-migration.sh

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "Migration complete!"
echo "Checking migration status..."
npx prisma migrate status
