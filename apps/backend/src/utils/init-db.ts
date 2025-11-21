import { PrismaClient } from '@prisma/client';
import { seedChallengeTemplates } from '../routes/challenge-templates';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');

    // Seed challenge templates
    try {
      await seedChallengeTemplates();
      console.log('✅ Challenge templates seeded');
    } catch (error) {
      console.log('⚠️  Challenge templates seeding skipped (may already exist)');
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}
