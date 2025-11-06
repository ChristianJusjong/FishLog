import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}
