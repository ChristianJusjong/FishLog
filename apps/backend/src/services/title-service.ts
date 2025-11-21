/**
 * Title/Rank Service
 * Handles user titles based on level
 */

export interface Title {
  name: string;
  emoji: string;
  minLevel: number;
  maxLevel: number;
}

export const TITLES: Title[] = [
  { name: 'Madding', emoji: '🪱', minLevel: 1, maxLevel: 2 },
  { name: 'Agn', emoji: '🎣', minLevel: 3, maxLevel: 5 },
  { name: 'Kystfisker', emoji: '🏖️', minLevel: 6, maxLevel: 10 },
  { name: 'Sportsfisker', emoji: '🎽', minLevel: 11, maxLevel: 15 },
  { name: 'Krogmester', emoji: '🪝', minLevel: 16, maxLevel: 20 },
  { name: 'Stangmand', emoji: '🎋', minLevel: 21, maxLevel: 25 },
  { name: 'Fiskekaptajn', emoji: '⚓', minLevel: 26, maxLevel: 30 },
  { name: 'Havets Jæger', emoji: '🏹', minLevel: 31, maxLevel: 40 },
  { name: 'Geddemester', emoji: '🐟', minLevel: 41, maxLevel: 50 },
  { name: 'Torskekong', emoji: '👑', minLevel: 51, maxLevel: 60 },
  { name: 'Ørredmagiker', emoji: '✨', minLevel: 61, maxLevel: 75 },
  { name: 'Fiskelegend', emoji: '🌟', minLevel: 76, maxLevel: 85 },
  { name: 'Havets Hersker', emoji: '🔱', minLevel: 86, maxLevel: 99 },
  { name: 'Neptun', emoji: '🧜‍♂️', minLevel: 100, maxLevel: 999 },
];

/**
 * Get title for a given level
 */
export function getTitleForLevel(level: number): Title {
  const title = TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
  return title || TITLES[0]; // Default to first title if not found
}

/**
 * Get title display string (emoji + name)
 */
export function getTitleDisplay(level: number): string {
  const title = getTitleForLevel(level);
  return `${title.emoji} ${title.name}`;
}

/**
 * Get all available titles
 */
export function getAllTitles(): Title[] {
  return TITLES;
}
