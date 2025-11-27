import { prisma } from "../lib/prisma";
import { seedChallengeTemplates } from '../routes/challenge-templates';


export async function initializeDatabase() {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified');

    // Seed challenge templates
    try {
      await seedChallengeTemplates();
    } catch (error) {
      // Templates may already exist
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
