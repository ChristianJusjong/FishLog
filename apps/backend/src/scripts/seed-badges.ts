import { badgeService } from '../services/badgeService.js';

async function main() {
  console.log('🎖️  Seeding badges...');

  try {
    await badgeService.seedBadges();
    console.log('✅ Badges seeded successfully!');
    console.log('');
    console.log('Available badges:');
    console.log('- 🎣 Første Fangst (bronze)');
    console.log('- 🌟 Begynder - 10 fangster (bronze)');
    console.log('- ⭐ Erfaren - 50 fangster (silver)');
    console.log('- 🏆 Mester - 100 fangster (gold)');
    console.log('- 🐋 Stor Fisk - 5kg+ (silver)');
    console.log('- 🦈 Kæmpe Fisk - 10kg+ (gold)');
    console.log('- 👥 Social - 5+ venner (bronze)');
    console.log('- 💪 Aktiv - 7 dage i streg (silver)');
    console.log('- 🎨 Varieret - 5+ arter (silver)');
    console.log('- 🥇 Konkurrence Vinder (platinum)');
    console.log('');
    console.log('All badges are now ready to be awarded!');
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
