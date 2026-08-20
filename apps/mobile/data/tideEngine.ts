/**
 * Tidevand-, Strøm- og Bidechance-Motor (Tide & Bite Prediction Engine)
 * Beregner realistisk M2 tidevandskurve (12.42t periode), flod/ebbe, strømhastighed og hugindeks.
 */

export interface HourlyTidePoint {
  time: string;
  hour: number;
  levelCm: number;
  phase: 'rising' | 'falling' | 'high' | 'low';
}

export interface TideData {
  phase: 'rising' | 'falling' | 'high' | 'low';
  phaseLabel: string;
  waterLevelCm: number;
  currentSpeedKnots: number;
  nextHighTide: Date;
  nextLowTide: Date;
  timeToNextHighHours: number;
  timeToNextLowHours: number;
  hourlyCurve: HourlyTidePoint[];
  biteChanceScore: number; // 0 - 100%
  biteChanceLabel: 'Svag' | 'God' | 'Fremragende' | '🔥 Ekstrem Hugchance';
}

export function calculateTideAndBite(
  latitude: number = 55.6761,
  longitude: number = 12.5683,
  date: Date = new Date(),
  pressureHpa: number = 1013
): TideData {
  const timestamp = date.getTime();

  // M2 Tidal Constituent period: ~12 hours 25 minutes (44714.4 seconds)
  const TIDE_PERIOD_MS = 12.4206 * 3600 * 1000;

  // Reference epoch (Jan 1, 2024 00:00 UTC)
  const EPOCH_MS = new Date('2024-01-01T00:00:00Z').getTime();
  const timeOffset = timestamp - EPOCH_MS;

  // Tidal cycle phase angle (0 to 2*PI)
  const phaseAngle = ((timeOffset % TIDE_PERIOD_MS) / TIDE_PERIOD_MS) * 2 * Math.PI;

  // Sine wave for water level (-60cm to +60cm typical Danish coastal range, higher in West Jutland)
  const isWestCoast = longitude < 9.5;
  const amplitudeCm = isWestCoast ? 75 : 35;
  const waterLevelCm = Math.round(amplitudeCm * Math.sin(phaseAngle));

  // Determine current tide phase
  const cosVal = Math.cos(phaseAngle);
  let phase: 'rising' | 'falling' | 'high' | 'low' = 'rising';
  let phaseLabel = 'Stigende vand (Flod)';

  if (Math.abs(Math.sin(phaseAngle)) > 0.92) {
    if (waterLevelCm > 0) {
      phase = 'high';
      phaseLabel = 'Højvande (Vandskifte)';
    } else {
      phase = 'low';
      phaseLabel = 'Lavvande (Vandskifte)';
    }
  } else if (cosVal > 0) {
    phase = 'rising';
    phaseLabel = 'Stigende vand (Flod 🌊)';
  } else {
    phase = 'falling';
    phaseLabel = 'Faldende vand (Ebbe ⬇️)';
  }

  // Tidal current speed peaks during mid-tide when water movement is fastest
  const currentSpeedKnots = parseFloat((Math.abs(cosVal) * 1.8).toFixed(1));

  // Next high tide (when phaseAngle = PI/2)
  let highAngleDiff = Math.PI / 2 - phaseAngle;
  if (highAngleDiff < 0) highAngleDiff += 2 * Math.PI;
  const timeToNextHighMs = (highAngleDiff / (2 * Math.PI)) * TIDE_PERIOD_MS;
  const nextHighTide = new Date(timestamp + timeToNextHighMs);
  const timeToNextHighHours = parseFloat((timeToNextHighMs / 3600000).toFixed(1));

  // Next low tide (when phaseAngle = 3*PI/2)
  let lowAngleDiff = (3 * Math.PI) / 2 - phaseAngle;
  if (lowAngleDiff < 0) lowAngleDiff += 2 * Math.PI;
  const timeToNextLowMs = (lowAngleDiff / (2 * Math.PI)) * TIDE_PERIOD_MS;
  const nextLowTide = new Date(timestamp + timeToNextLowMs);
  const timeToNextLowHours = parseFloat((timeToNextLowMs / 3600000).toFixed(1));

  // 24-hour curve
  const hourlyCurve: HourlyTidePoint[] = [];
  const currentHour = date.getHours();

  for (let i = -3; i <= 9; i++) {
    const futureMs = timestamp + i * 3600 * 1000;
    const futureDate = new Date(futureMs);
    const fPhaseAngle = (((futureMs - EPOCH_MS) % TIDE_PERIOD_MS) / TIDE_PERIOD_MS) * 2 * Math.PI;
    const fLevel = Math.round(amplitudeCm * Math.sin(fPhaseAngle));
    const fCos = Math.cos(fPhaseAngle);

    let fPhase: 'rising' | 'falling' | 'high' | 'low' = 'rising';
    if (Math.abs(Math.sin(fPhaseAngle)) > 0.92) {
      fPhase = fLevel > 0 ? 'high' : 'low';
    } else {
      fPhase = fCos > 0 ? 'rising' : 'falling';
    }

    hourlyCurve.push({
      time: `${futureDate.getHours().toString().padStart(2, '0')}:00`,
      hour: futureDate.getHours(),
      levelCm: fLevel,
      phase: fPhase,
    });
  }

  // Calculate Bite Chance Score (0-100%)
  // - High score during water movement (current > 0.8 knots)
  // - Stable barometric pressure (1012 - 1022 hPa)
  // - Dawn/Dusk golden hours
  let score = 45;

  // Water movement bonus (fish bite when current moves bait)
  if (currentSpeedKnots > 1.0) score += 25;
  else if (currentSpeedKnots > 0.5) score += 15;

  // Pressure stability bonus
  if (pressureHpa >= 1012 && pressureHpa <= 1022) score += 15;
  else if (pressureHpa < 1000 || pressureHpa > 1030) score -= 10;

  // Golden hour bonus (dawn / dusk)
  if ((currentHour >= 5 && currentHour <= 8) || (currentHour >= 18 && currentHour <= 22)) {
    score += 15;
  }

  // Clamp 0-98%
  const biteChanceScore = Math.min(98, Math.max(15, score));

  let biteChanceLabel: 'Svag' | 'God' | 'Fremragende' | '🔥 Ekstrem Hugchance' = 'God';
  if (biteChanceScore >= 80) biteChanceLabel = '🔥 Ekstrem Hugchance';
  else if (biteChanceScore >= 65) biteChanceLabel = 'Fremragende';
  else if (biteChanceScore >= 45) biteChanceLabel = 'God';
  else biteChanceLabel = 'Svag';

  return {
    phase,
    phaseLabel,
    waterLevelCm,
    currentSpeedKnots,
    nextHighTide,
    nextLowTide,
    timeToNextHighHours,
    timeToNextLowHours,
    hourlyCurve,
    biteChanceScore,
    biteChanceLabel,
  };
}
