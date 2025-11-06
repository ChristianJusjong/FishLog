import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Enable PostGIS extension
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');

    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't throw - let app continue even if PostGIS fails
    return false;
  }
}
