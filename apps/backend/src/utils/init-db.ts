import { prisma } from "../lib/prisma";
import { seedChallengeTemplates } from '../routes/challenge-templates';


export async function initializeDatabase() {
  try {
    // Enable PostGIS extension
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
    } catch (error) {
      // Continue anyway as it might already exist
    }

    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    // Seed challenge templates
    try {
      await seedChallengeTemplates();
    } catch (error) {
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}
