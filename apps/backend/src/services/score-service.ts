/**
 * Score Calculation Service
 * Handles score calculations based on fish rarity and weight
 */

// Rarity multipliers
const RARITY_MULTIPLIERS = {
  common: 1,
  uncommon: 2,
  rare: 3,
  very_rare: 5,
  legendary: 10,
} as const;

type Rarity = keyof typeof RARITY_MULTIPLIERS;

/**
 * Calculate score for a catch
 * Score = Rarity Multiplier × Weight (kg)
 */
export function calculateCatchScore(rarity: string | null, weightKg: number | null): number {
  if (!weightKg || weightKg <= 0) return 0;

  const rarityKey = (rarity?.toLowerCase() || 'common') as Rarity;
  const multiplier = RARITY_MULTIPLIERS[rarityKey] || RARITY_MULTIPLIERS.common;

  return multiplier * weightKg;
}

/**
 * Calculate total score from multiple catches
 */
export function calculateTotalScore(catches: Array<{ rarity: string | null; weightKg: number | null }>): number {
  return catches.reduce((total, catch_) => {
    return total + calculateCatchScore(catch_.rarity, catch_.weightKg);
  }, 0);
}

/**
 * Get rarity multiplier
 */
export function getRarityMultiplier(rarity: string | null): number {
  const rarityKey = (rarity?.toLowerCase() || 'common') as Rarity;
  return RARITY_MULTIPLIERS[rarityKey] || RARITY_MULTIPLIERS.common;
}
