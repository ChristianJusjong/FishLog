import { badgeService } from '../services/badgeService.js';

async function main() {
  try {
    await badgeService.seedBadges();
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
