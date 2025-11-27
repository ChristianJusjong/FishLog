import { prisma } from "../lib/prisma";
import { seedChallengeTemplates } from '../routes/challenge-templates';


export async function initializeDatabase() {
  try {
    // Enable PostGIS extension (optional - Railway PostgreSQL doesn't have it)
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
      console.log('PostGIS extension enabled');
    } catch (error: unknown) {
      // PostGIS not available - this is OK, geo features will be limited
      console.log('PostGIS not available - continuing without geo features');
    }

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
