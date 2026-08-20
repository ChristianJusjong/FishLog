/**
 * Officielle Danske Fiskeriregler: Mindstemål og Fredningstider
 * Kilde: Ministeriet for Fødevarer, Landbrug og Fiskeri (Fiskeristyrelsen)
 */

export interface SpeciesRegulation {
  speciesName: string;
  aliases: string[];
  minimumSizeCm?: number;
  maxSizeCm?: number; // F.eks. beskyttelse af store moderfisk
  isTotallyProtected?: boolean; // F.eks. Stalling, Snæbel
  closedSeasons?: {
    startMonth: number; // 1-indexed (1 = Jan, 12 = Dec)
    startDay: number;
    endMonth: number;
    endDay: number;
    environment: 'saltwater' | 'freshwater' | 'all';
    description: string;
  }[];
  notes?: string;
}

export const DANISH_FISHING_REGULATIONS: SpeciesRegulation[] = [
  {
    speciesName: 'Havørred',
    aliases: ['havoered', 'havorred', 'havørred', 'sea trout'],
    minimumSizeCm: 40,
    closedSeasons: [
      {
        startMonth: 11,
        startDay: 16,
        endMonth: 1,
        endDay: 15,
        environment: 'saltwater',
        description: 'Farvede (gydemodne) havørreder i saltvand er fredet 16. nov - 15. jan. Blanke ørreder med løse skæl må hjemtages.',
      },
      {
        startMonth: 11,
        startDay: 16,
        endMonth: 1,
        endDay: 15,
        environment: 'freshwater',
        description: 'Fredet i ferskvand (nogle vandløb har udvidet fredning indtil 15. april).',
      },
    ],
    notes: 'Mindstemål er 40 cm i hele Danmark (både fersk- og saltvand).',
  },
  {
    speciesName: 'Laks',
    aliases: ['laks', 'salmon', 'atlantisk laks'],
    minimumSizeCm: 60,
    closedSeasons: [
      {
        startMonth: 11,
        startDay: 16,
        endMonth: 1,
        endDay: 15,
        environment: 'all',
        description: 'Farvede laks er fredet 16. nov - 15. jan. I lakseåer gælder særlige kvoter.',
      },
    ],
    notes: 'Mindstemål 60 cm.',
  },
  {
    speciesName: 'Bækørred',
    aliases: ['baekoerred', 'bækørred', 'brown trout'],
    minimumSizeCm: 30,
    closedSeasons: [
      {
        startMonth: 11,
        startDay: 16,
        endMonth: 1,
        endDay: 15,
        environment: 'freshwater',
        description: 'Fredet i gydetiden 16. nov - 15. jan.',
      },
    ],
  },
  {
    speciesName: 'Gedde',
    aliases: ['gedde', 'pike', 'northern pike'],
    minimumSizeCm: 60,
    closedSeasons: [
      {
        startMonth: 4,
        startDay: 1,
        endMonth: 4,
        endDay: 30,
        environment: 'freshwater',
        description: 'Fredet i ferskvand i hele april måned under gydningen.',
      },
      {
        startMonth: 4,
        startDay: 1,
        endMonth: 5,
        endDay: 15,
        environment: 'saltwater',
        description: 'Fredet i brakvand/saltvand 1. april - 15. maj.',
      },
    ],
    notes: 'Mindstemål 60 cm. I mange vande gælder Catch & Release eller vinduesmål.',
  },
  {
    speciesName: 'Sandart',
    aliases: ['sandart', 'zander', 'pikeperch'],
    minimumSizeCm: 50,
    closedSeasons: [
      {
        startMonth: 5,
        startDay: 1,
        endMonth: 5,
        endDay: 31,
        environment: 'freshwater',
        description: 'Fredet i hele maj måned for at beskytte gydende fisk og reder.',
      },
    ],
    notes: 'Mindstemål 50 cm.',
  },
  {
    speciesName: 'Aborre',
    aliases: ['aborre', 'perch', 'european perch'],
    minimumSizeCm: 20, // Anbefalet
    notes: 'Intet officielt nationalt mindstemål i ferskvand, men 20 cm anbefales for bestandens sundhed.',
  },
  {
    speciesName: 'Torsk',
    aliases: ['torsk', 'cod', 'atlantic cod'],
    minimumSizeCm: 35,
    notes: 'Mindstemål 35 cm i Nordsøen/Skagerrak, 30 cm i indre danske farvande. Bemærk gældende dags-baglimits i Østersøen.',
  },
  {
    speciesName: 'Rødspætte',
    aliases: ['rodspaette', 'rødspætte', 'plaice'],
    minimumSizeCm: 27,
    closedSeasons: [
      {
        startMonth: 1,
        startDay: 15,
        endMonth: 4,
        endDay: 30,
        environment: 'saltwater',
        description: 'Hunderødspætter (med rogn) er fredet i visse farvande 15. jan - 30. april.',
      },
    ],
    notes: 'Mindstemål 27 cm.',
  },
  {
    speciesName: 'Skrubbe',
    aliases: ['skrubbe', 'flounder'],
    minimumSizeCm: 23,
    notes: 'Mindstemål 23 cm (Nordsøen/Limfjorden), 20 cm i Østersøen.',
  },
  {
    speciesName: 'Pighvar',
    aliases: ['pighvar', 'pighvarre', 'turbot'],
    minimumSizeCm: 30,
    notes: 'Mindstemål 30 cm.',
  },
  {
    speciesName: 'Slethvar',
    aliases: ['slethvar', 'slethvarre', 'brill'],
    minimumSizeCm: 30,
    notes: 'Mindstemål 30 cm.',
  },
  {
    speciesName: 'Ål',
    aliases: ['aal', 'ål', 'eel'],
    minimumSizeCm: 45,
    notes: 'Totalfredet for lystfiskere i saltvand. I ferskvand gælder mindstemål 45 cm.',
  },
  {
    speciesName: 'Stalling',
    aliases: ['stalling', 'grayling'],
    isTotallyProtected: true,
    notes: 'TOTALFREDET i Danmark – skal altid genudsættes øjeblikkeligt og skånsomt!',
  },
  {
    speciesName: 'Snæbel',
    aliases: ['snaebel', 'snæbel'],
    isTotallyProtected: true,
    notes: 'TOTALFREDET i Danmark – rødlistet art, skal altid genudsættes øjeblikkeligt!',
  },
];

export interface RegulationCheckResult {
  regulation: SpeciesRegulation | null;
  isUnderMinimumSize: boolean;
  minimumSizeCm: number | null;
  isClosedSeason: boolean;
  closedSeasonDescription: string | null;
  isTotallyProtected: boolean;
  badgeType: 'legal' | 'warning_undersize' | 'warning_closed_season' | 'protected';
  message: string;
}

export function checkCatchRegulation(
  speciesName: string,
  lengthCm?: number | string,
  date: Date = new Date(),
  isSpawningOrColored: boolean = false
): RegulationCheckResult {
  const cleanName = speciesName.trim().toLowerCase();

  const reg = DANISH_FISHING_REGULATIONS.find(
    (r) =>
      r.speciesName.toLowerCase() === cleanName ||
      r.aliases.some((alias) => cleanName.includes(alias) || alias.includes(cleanName))
  );

  if (!reg) {
    return {
      regulation: null,
      isUnderMinimumSize: false,
      minimumSizeCm: null,
      isClosedSeason: false,
      closedSeasonDescription: null,
      isTotallyProtected: false,
      badgeType: 'legal',
      message: 'Ingen særlige nationale begrænsninger registreret.',
    };
  }

  if (reg.isTotallyProtected) {
    return {
      regulation: reg,
      isUnderMinimumSize: false,
      minimumSizeCm: null,
      isClosedSeason: true,
      closedSeasonDescription: 'Totalfredet art i Danmark',
      isTotallyProtected: true,
      badgeType: 'protected',
      message: `🚫 ${reg.speciesName} er totalfredet i Danmark. Skal altid genudsættes skånsomt!`,
    };
  }

  const numericLength = lengthCm ? (typeof lengthCm === 'string' ? parseFloat(lengthCm.replace(',', '.')) : lengthCm) : undefined;
  const isUnderMinimumSize = !!(reg.minimumSizeCm && numericLength && numericLength < reg.minimumSizeCm);

  // Check closed seasons
  let isClosedSeason = false;
  let closedSeasonDescription: string | null = null;

  if (reg.closedSeasons && reg.closedSeasons.length > 0) {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    for (const cs of reg.closedSeasons) {
      let inRange = false;
      if (cs.startMonth <= cs.endMonth) {
        // Normal range within same year (f.eks. april: 4 -> 4)
        if (
          (month > cs.startMonth || (month === cs.startMonth && day >= cs.startDay)) &&
          (month < cs.endMonth || (month === cs.endMonth && day <= cs.endDay))
        ) {
          inRange = true;
        }
      } else {
        // Range across new year (f.eks. nov -> jan: 11 -> 1)
        if (
          (month > cs.startMonth || (month === cs.startMonth && day >= cs.startDay)) ||
          (month < cs.endMonth || (month === cs.endMonth && day <= cs.endDay))
        ) {
          inRange = true;
        }
      }

      if (inRange) {
        // For trout/salmon, check if colored or in freshwater
        if (reg.speciesName === 'Havørred' || reg.speciesName === 'Laks') {
          if (isSpawningOrColored || cs.environment === 'freshwater') {
            isClosedSeason = true;
            closedSeasonDescription = cs.description;
            break;
          }
        } else {
          isClosedSeason = true;
          closedSeasonDescription = cs.description;
          break;
        }
      }
    }
  }

  if (isUnderMinimumSize) {
    return {
      regulation: reg,
      isUnderMinimumSize: true,
      minimumSizeCm: reg.minimumSizeCm || null,
      isClosedSeason,
      closedSeasonDescription,
      isTotallyProtected: false,
      badgeType: 'warning_undersize',
      message: `⚠️ Fisken er under det officielle mindstemål (${reg.minimumSizeCm} cm). Husk at genudsætte skånsomt!`,
    };
  }

  if (isClosedSeason) {
    return {
      regulation: reg,
      isUnderMinimumSize: false,
      minimumSizeCm: reg.minimumSizeCm || null,
      isClosedSeason: true,
      closedSeasonDescription,
      isTotallyProtected: false,
      badgeType: 'warning_closed_season',
      message: `⚠️ Fredningstid: ${closedSeasonDescription}`,
    };
  }

  return {
    regulation: reg,
    isUnderMinimumSize: false,
    minimumSizeCm: reg.minimumSizeCm || null,
    isClosedSeason: false,
    closedSeasonDescription: null,
    isTotallyProtected: false,
    badgeType: 'legal',
    message: reg.minimumSizeCm
      ? ` Lovlig fangst (mindstemål er ${reg.minimumSizeCm} cm).`
      : ' Ingen mindstemålsbegrænsning.',
  };
}

/**
 * Officielle Danske Fredningsbælter ved Å-udløb (Fiskeristyrelsen)
 * Standard radius er 500m fra udløb/munding.
 */
export interface ProtectedZone {
  id: string;
  name: string;
  waterway: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isAllYear: boolean;
  periodText: string;
}

export const DANISH_PROTECTED_ZONES: ProtectedZone[] = [
  {
    id: 'guden-udlob',
    name: 'Gudenåens udløb i Randers Fjord',
    waterway: 'Gudenåen',
    latitude: 56.463,
    longitude: 10.054,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'skjern-udlob',
    name: 'Skjern Å udløb i Ringkøbing Fjord',
    waterway: 'Skjern Å',
    latitude: 55.918,
    longitude: 8.412,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'kolding-udlob',
    name: 'Kolding Å udløb i Kolding Fjord',
    waterway: 'Kolding Å',
    latitude: 55.492,
    longitude: 9.487,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'tryggevælde-udlob',
    name: 'Tryggevælde Å udløb (Køge Bugt)',
    waterway: 'Tryggevælde Å',
    latitude: 55.405,
    longitude: 12.218,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'tuse-udlob',
    name: 'Tuse Å udløb i Holbæk Fjord',
    waterway: 'Tuse Å',
    latitude: 55.728,
    longitude: 11.668,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'odense-udlob',
    name: 'Odense Å udløb i Odense Fjord',
    waterway: 'Odense Å',
    latitude: 55.441,
    longitude: 10.428,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'karup-udlob',
    name: 'Karup Å udløb i Skive Fjord',
    waterway: 'Karup Å',
    latitude: 56.571,
    longitude: 9.048,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'susaa-udlob',
    name: 'Suså udløb ved Karrebæksminde',
    waterway: 'Susåen',
    latitude: 55.185,
    longitude: 11.652,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
  {
    id: 'esrum-udlob',
    name: 'Esrum Å udløb ved Dronningmølle',
    waterway: 'Esrum Å',
    latitude: 56.101,
    longitude: 12.392,
    radiusMeters: 500,
    isAllYear: true,
    periodText: 'Helårsfredet (500m zone)',
  },
];

/**
 * Calculates Haversine distance in meters between two GPS coordinates
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if current GPS position is within or near any official Danish protected river mouth
 */
export function checkNearbyProtectedZone(
  latitude: number,
  longitude: number,
  warningThresholdMeters = 1000
): { zone: ProtectedZone; distanceMeters: number; isInside: boolean } | null {
  for (const zone of DANISH_PROTECTED_ZONES) {
    const dist = getDistanceMeters(latitude, longitude, zone.latitude, zone.longitude);
    if (dist <= warningThresholdMeters) {
      return {
        zone,
        distanceMeters: Math.round(dist),
        isInside: dist <= zone.radiusMeters,
      };
    }
  }
  return null;
}
