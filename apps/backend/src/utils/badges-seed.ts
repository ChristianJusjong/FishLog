import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  rule: string;
  ruleData?: any;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  category: 'achievement' | 'funny' | 'seasonal' | 'social' | 'conservation' | 'rare' | 'secret';
  isSecret?: boolean;
  rarity?: number; // 0-100, higher = more rare
}

const badges: BadgeDefinition[] = [
  // ==================== ACHIEVEMENT BADGES ====================

  // First Catch Series
  {
    name: 'First Blood',
    description: 'Fang din første fisk!',
    icon: '🎣',
    rule: 'first_catch',
    tier: 'bronze',
    category: 'achievement',
  },
  {
    name: '10 Club',
    description: 'Fang 10 fisk',
    icon: '🔟',
    rule: 'catch_count',
    ruleData: { count: 10 },
    tier: 'bronze',
    category: 'achievement',
  },
  {
    name: '50 Club',
    description: 'Fang 50 fisk',
    icon: '5️⃣0️⃣',
    rule: 'catch_count',
    ruleData: { count: 50 },
    tier: 'silver',
    category: 'achievement',
  },
  {
    name: '100 Club',
    description: 'Fang 100 fisk - Du er dedikeret!',
    icon: '💯',
    rule: 'catch_count',
    ruleData: { count: 100 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: '500 Club',
    description: 'Fang 500 fisk - Legendarisk fisker!',
    icon: '🏆',
    rule: 'catch_count',
    ruleData: { count: 500 },
    tier: 'platinum',
    category: 'achievement',
  },
  {
    name: '1000 Club',
    description: 'Fang 1000 fisk - Er du en professionel?!',
    icon: '👑',
    rule: 'catch_count',
    ruleData: { count: 1000 },
    tier: 'legendary',
    category: 'achievement',
    rarity: 99,
  },

  // Species Master Series
  {
    name: 'Gedde Gigant',
    description: 'Fang en gedde over 5 kg',
    icon: '🦈',
    rule: 'species_weight',
    ruleData: { species: 'Gedde', weight: 5 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: 'Aborre Ace',
    description: 'Fang 20 aborrer',
    icon: '🐟',
    rule: 'species_count',
    ruleData: { species: 'Aborre', count: 20 },
    tier: 'silver',
    category: 'achievement',
  },
  {
    name: 'Sandart Sultan',
    description: 'Fang en sandart over 3 kg',
    icon: '⚡',
    rule: 'species_weight',
    ruleData: { species: 'Sandart', weight: 3 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: 'Havørred Helt',
    description: 'Fang en havørred over 2 kg',
    icon: '🌊',
    rule: 'species_weight',
    ruleData: { species: 'Havørred', weight: 2 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: 'FiskeDex Mester',
    description: 'Fang alle 20 danske fisk!',
    icon: '🎮',
    rule: 'fiskedex_complete',
    tier: 'legendary',
    category: 'achievement',
    rarity: 95,
  },

  // ==================== FUNNY BADGES ====================

  {
    name: 'Skunked',
    description: 'Kom hjem tom-håndet fra 5 ture i træk 😅',
    icon: '🦨',
    rule: 'zero_catch_streak',
    ruleData: { streak: 5 },
    tier: 'bronze',
    category: 'funny',
  },
  {
    name: 'Den Der Slap Væk',
    description: 'Rapporter din første "den store der slap væk" historie',
    icon: '🐟💨',
    rule: 'lost_fish_story',
    tier: 'bronze',
    category: 'funny',
  },
  {
    name: 'Morgenfugl',
    description: 'Fisk før kl. 6 om morgenen 10 gange',
    icon: '🌅',
    rule: 'early_bird',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'funny',
  },
  {
    name: 'Natuglen',
    description: 'Fisk efter kl. 22 om aftenen 10 gange',
    icon: '🦉',
    rule: 'night_owl',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'funny',
  },
  {
    name: 'Samlerens Forbandelse',
    description: 'Mist 20 madding/wobblers',
    icon: '🪝💸',
    rule: 'lost_lures',
    ruleData: { count: 20 },
    tier: 'bronze',
    category: 'funny',
  },
  {
    name: 'Filtret Fænger',
    description: 'Tag 50 billeder af fangster (Instagram fisker?)',
    icon: '📸',
    rule: 'catch_photos',
    ruleData: { count: 50 },
    tier: 'silver',
    category: 'funny',
  },
  {
    name: 'Vejrguden Hader Mig',
    description: 'Fisk i regnvejr 10 gange',
    icon: '☔',
    rule: 'rain_fishing',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'funny',
  },
  {
    name: 'Løgneren',
    description: 'Få en fangst afvist af community validation 3 gange',
    icon: '🤥',
    rule: 'validation_rejected',
    ruleData: { count: 3 },
    tier: 'bronze',
    category: 'funny',
  },
  {
    name: 'Minimalist',
    description: 'Fang en fisk under 10 cm (tæller den?)',
    icon: '🤏',
    rule: 'tiny_catch',
    ruleData: { length: 10 },
    tier: 'bronze',
    category: 'funny',
  },
  {
    name: 'Blank Day Bandit',
    description: 'Log 10 ture uden fangster (ærlighed belønnes!)',
    icon: '🎭',
    rule: 'blank_days',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'funny',
  },
  {
    name: 'Gear Nørd',
    description: 'Log 50+ dele fiskegrej i appen',
    icon: '🎒',
    rule: 'gear_hoarder',
    ruleData: { count: 50 },
    tier: 'gold',
    category: 'funny',
  },

  // ==================== SOCIAL BADGES ====================

  {
    name: 'Social Sommerfugl',
    description: 'Få 100 følgere',
    icon: '🦋',
    rule: 'follower_count',
    ruleData: { count: 100 },
    tier: 'silver',
    category: 'social',
  },
  {
    name: 'Influencer',
    description: 'Få 500 følgere',
    icon: '🌟',
    rule: 'follower_count',
    ruleData: { count: 500 },
    tier: 'gold',
    category: 'social',
  },
  {
    name: 'Viral Fisker',
    description: 'Få 1000+ likes på én fangst',
    icon: '🔥',
    rule: 'viral_catch',
    ruleData: { likes: 1000 },
    tier: 'platinum',
    category: 'social',
    rarity: 85,
  },
  {
    name: 'Kommentar Konge',
    description: 'Skriv 100 kommentarer',
    icon: '💬',
    rule: 'comment_count',
    ruleData: { count: 100 },
    tier: 'silver',
    category: 'social',
  },
  {
    name: 'Like Machine',
    description: 'Giv 500 likes',
    icon: '👍',
    rule: 'like_count',
    ruleData: { count: 500 },
    tier: 'bronze',
    category: 'social',
  },
  {
    name: 'Guide',
    description: 'Hjælp 10 nye fiskere med tips',
    icon: '🧭',
    rule: 'help_beginners',
    ruleData: { count: 10 },
    tier: 'gold',
    category: 'social',
  },
  {
    name: 'Club Grundlægger',
    description: 'Opret en club med 20+ medlemmer',
    icon: '🏛️',
    rule: 'club_founder',
    ruleData: { members: 20 },
    tier: 'gold',
    category: 'social',
  },

  // ==================== CONSERVATION BADGES ====================

  {
    name: 'Catch & Release Champion',
    description: 'Genudsat 50 fisk',
    icon: '♻️',
    rule: 'release_count',
    ruleData: { count: 50 },
    tier: 'gold',
    category: 'conservation',
  },
  {
    name: '100% Genudsat',
    description: '100 fanget, 100 genudsat!',
    icon: '💚',
    rule: 'perfect_release_rate',
    ruleData: { count: 100 },
    tier: 'platinum',
    category: 'conservation',
    rarity: 80,
  },
  {
    name: 'Øko Kriger',
    description: 'Rapporter affald på 10 fiskepladser',
    icon: '🌱',
    rule: 'report_trash',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'conservation',
  },
  {
    name: 'Størrelsesbevidst',
    description: 'Genudsat 20 fisk under mindstemål',
    icon: '📏',
    rule: 'undersized_release',
    ruleData: { count: 20 },
    tier: 'silver',
    category: 'conservation',
  },
  {
    name: 'Fredning Respekterer',
    description: 'Log ingen fangster i fredningsperioder hele året',
    icon: '🛡️',
    rule: 'respect_seasons',
    tier: 'gold',
    category: 'conservation',
  },

  // ==================== SEASONAL BADGES ====================

  {
    name: 'Vinter Kriger',
    description: 'Fisk i vinteren (Dec-Feb) 10 gange',
    icon: '❄️',
    rule: 'winter_fishing',
    ruleData: { count: 10 },
    tier: 'silver',
    category: 'seasonal',
  },
  {
    name: 'Sommer Slammer',
    description: 'Fisk i sommeren (Jun-Aug) 20 gange',
    icon: '☀️',
    rule: 'summer_fishing',
    ruleData: { count: 20 },
    tier: 'bronze',
    category: 'seasonal',
  },
  {
    name: 'Forår Fanatiker',
    description: 'Fang 30 fisk i foråret (Mar-Maj)',
    icon: '🌸',
    rule: 'spring_fishing',
    ruleData: { count: 30 },
    tier: 'silver',
    category: 'seasonal',
  },
  {
    name: 'Efterårs Ekspert',
    description: 'Fang 30 fisk om efteråret (Sep-Nov)',
    icon: '🍂',
    rule: 'fall_fishing',
    ruleData: { count: 30 },
    tier: 'silver',
    category: 'seasonal',
  },
  {
    name: 'Hele Året Rundt',
    description: 'Fang mindst én fisk hver måned i et år',
    icon: '📅',
    rule: 'twelve_month_streak',
    tier: 'platinum',
    category: 'seasonal',
    rarity: 75,
  },
  {
    name: 'Jule Gedde',
    description: 'Fang en gedde juledag',
    icon: '🎄',
    rule: 'christmas_pike',
    tier: 'gold',
    category: 'seasonal',
    isSecret: true,
  },
  {
    name: 'Nytårs Fisk',
    description: 'Fang en fisk nytårsdag',
    icon: '🎆',
    rule: 'new_year_catch',
    tier: 'gold',
    category: 'seasonal',
    isSecret: true,
  },

  // ==================== LOCATION BADGES ====================

  {
    name: 'Local Legend',
    description: 'Bliv #1 på en fiskespot i 30 dage',
    icon: '👑',
    rule: 'local_legend',
    ruleData: { days: 30 },
    tier: 'platinum',
    category: 'achievement',
    rarity: 70,
  },
  {
    name: 'Globetrotter',
    description: 'Fisk på 20 forskellige spots',
    icon: '🌍',
    rule: 'spot_diversity',
    ruleData: { count: 20 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: 'Explorer',
    description: 'Fisk på 50 forskellige spots',
    icon: '🗺️',
    rule: 'spot_diversity',
    ruleData: { count: 50 },
    tier: 'platinum',
    category: 'achievement',
    rarity: 80,
  },
  {
    name: 'Segment Mester',
    description: 'Hold PR på 10 forskellige segments',
    icon: '🏅',
    rule: 'segment_master',
    ruleData: { count: 10 },
    tier: 'platinum',
    category: 'achievement',
    rarity: 85,
  },

  // ==================== STREAK BADGES ====================

  {
    name: '7 Dages Streak',
    description: 'Fisk 7 dage i træk',
    icon: '🔥',
    rule: 'fishing_streak',
    ruleData: { days: 7 },
    tier: 'silver',
    category: 'achievement',
  },
  {
    name: '30 Dages Streak',
    description: 'Fisk 30 dage i træk - Dedikeret!',
    icon: '🔥🔥',
    rule: 'fishing_streak',
    ruleData: { days: 30 },
    tier: 'platinum',
    category: 'achievement',
    rarity: 90,
  },
  {
    name: 'Weekend Warrior',
    description: 'Fisk hver weekend i 10 uger',
    icon: '⚔️',
    rule: 'weekend_streak',
    ruleData: { weeks: 10 },
    tier: 'gold',
    category: 'achievement',
  },

  // ==================== RARE/LEGENDARY BADGES ====================

  {
    name: 'Unicorn',
    description: 'Fang en ekstremt sjælden fisk (ål, helt, etc.)',
    icon: '🦄',
    rule: 'rare_species',
    tier: 'legendary',
    category: 'rare',
    rarity: 98,
    isSecret: true,
  },
  {
    name: 'Dobbelt Trubbel',
    description: 'Fang 2 fisk på én gang!',
    icon: '🎣🎣',
    rule: 'double_catch',
    tier: 'gold',
    category: 'rare',
    rarity: 85,
  },
  {
    name: 'Perfect Storm',
    description: 'Fang 10+ fisk på én session',
    icon: '⛈️',
    rule: 'session_catch_count',
    ruleData: { count: 10 },
    tier: 'platinum',
    category: 'rare',
    rarity: 75,
  },
  {
    name: 'Rekord Bryder',
    description: 'Slå din personlige rekord 3 gange på én dag',
    icon: '📈',
    rule: 'record_breaker',
    ruleData: { count: 3 },
    tier: 'gold',
    category: 'rare',
    rarity: 70,
  },
  {
    name: 'Fuldmåne Mystik',
    description: 'Fang en kæmpe fisk ved fuldmåne',
    icon: '🌕',
    rule: 'full_moon_trophy',
    tier: 'legendary',
    category: 'rare',
    rarity: 95,
    isSecret: true,
  },
  {
    name: 'Beta Tester',
    description: 'Var blandt de første 100 brugere!',
    icon: '🚀',
    rule: 'early_adopter',
    ruleData: { userNumber: 100 },
    tier: 'legendary',
    category: 'rare',
    rarity: 100,
    isSecret: true,
  },
  {
    name: 'OG Fisker',
    description: 'Var blandt de første 10 brugere!',
    icon: '👑🚀',
    rule: 'founder',
    ruleData: { userNumber: 10 },
    tier: 'legendary',
    category: 'rare',
    rarity: 100,
    isSecret: true,
  },

  // ==================== CHALLENGE BADGES ====================

  {
    name: 'Challenge Champion',
    description: 'Vind 5 challenges',
    icon: '🥇',
    rule: 'challenge_wins',
    ruleData: { count: 5 },
    tier: 'gold',
    category: 'achievement',
  },
  {
    name: 'Challenge Deltager',
    description: 'Deltag i 10 challenges',
    icon: '🎯',
    rule: 'challenge_participation',
    ruleData: { count: 10 },
    tier: 'bronze',
    category: 'achievement',
  },
  {
    name: 'Underdog',
    description: 'Vind en challenge som #10+ seed',
    icon: '🐕',
    rule: 'underdog_win',
    tier: 'gold',
    category: 'rare',
    rarity: 80,
  },

  // ==================== SECRET/EASTER EGG BADGES ====================

  {
    name: 'Konami Kode',
    description: '↑ ↑ ↓ ↓ ← → ← → B A',
    icon: '🎮',
    rule: 'konami_code',
    tier: 'legendary',
    category: 'secret',
    rarity: 99,
    isSecret: true,
  },
  {
    name: 'Bug Hunter',
    description: 'Rapporter en fejl der bliver fixet',
    icon: '🐛',
    rule: 'bug_report',
    tier: 'gold',
    category: 'secret',
    isSecret: true,
  },
  {
    name: 'Læser Manualen',
    description: 'Se hele tutorial-gennemgangen',
    icon: '📚',
    rule: 'complete_tutorial',
    tier: 'bronze',
    category: 'secret',
    isSecret: true,
  },
  {
    name: '404 Fisk Ikke Fundet',
    description: 'Prøv at logge en fisk der ikke eksisterer',
    icon: '🔍',
    rule: 'invalid_species',
    tier: 'bronze',
    category: 'funny',
    isSecret: true,
  },
];

export async function seedBadges() {
  console.log('🏅 Seeding badges...');

  for (const badge of badges) {
    try {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: {
          description: badge.description,
          icon: badge.icon,
          rule: badge.rule,
          ruleData: badge.ruleData ? JSON.stringify(badge.ruleData) : null,
          tier: badge.tier,
        },
        create: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rule: badge.rule,
          ruleData: badge.ruleData ? JSON.stringify(badge.ruleData) : null,
          tier: badge.tier,
        },
      });
      console.log(`✅ Created/Updated: ${badge.name} (${badge.tier})`);
    } catch (error) {
      console.error(`❌ Failed to create ${badge.name}:`, error);
    }
  }

  const badgeCount = await prisma.badge.count();
  console.log(`\n🎉 Total badges in database: ${badgeCount}`);
  console.log('\nBadge categories:');
  console.log(`  Achievement: ${badges.filter(b => b.category === 'achievement').length}`);
  console.log(`  Funny: ${badges.filter(b => b.category === 'funny').length}`);
  console.log(`  Social: ${badges.filter(b => b.category === 'social').length}`);
  console.log(`  Conservation: ${badges.filter(b => b.category === 'conservation').length}`);
  console.log(`  Seasonal: ${badges.filter(b => b.category === 'seasonal').length}`);
  console.log(`  Rare: ${badges.filter(b => b.category === 'rare').length}`);
  console.log(`  Secret: ${badges.filter(b => b.category === 'secret').length}`);
  console.log(`\nLegendary badges: ${badges.filter(b => b.tier === 'legendary').length}`);
  console.log(`Secret badges: ${badges.filter(b => b.isSecret).length}`);
}

// Run if called directly
if (require.main === module) {
  seedBadges()
    .then(() => {
      console.log('\n✨ Badge seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding badges:', error);
      process.exit(1);
    });
}

export { badges };
