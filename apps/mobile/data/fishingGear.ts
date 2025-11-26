/**
 * Comprehensive Danish Fishing Gear Database
 * Data sourced from:
 * - fishingindenmark.info/fiskeguide
 * - effektlageret.dk/shop/fang-en-fisk
 * - Common fishing knowledge
 */

// =============================================================================
// TYPES
// =============================================================================

export type GearCategory = 'rod' | 'reel' | 'line' | 'lure' | 'bait' | 'rig' | 'accessory';
export type FishingMethod = 'spinning' | 'fly' | 'float' | 'bottom' | 'trolling' | 'jigging' | 'dropshot';
export type WaterType = 'freshwater' | 'saltwater' | 'brackish';

export interface GearItem {
  id: string;
  name: string;
  nameDa: string;
  category: GearCategory;
  description?: string;
  descriptionDa?: string;
  methods?: FishingMethod[];
  waterTypes?: WaterType[];
  targetSpecies?: string[]; // Species IDs from fishingLocations.ts
  specifications?: {
    weight?: string;
    length?: string;
    size?: string;
    color?: string[];
  };
  popularity?: number; // 1-10 for sorting
}

export interface LureType {
  id: string;
  name: string;
  nameDa: string;
  category: 'hardlure' | 'softlure' | 'spinner' | 'spoon' | 'fly' | 'jig';
  description: string;
  descriptionDa: string;
  targetSpecies: string[];
  recommendedSizes?: string[];
  recommendedColors?: string[];
  techniques?: string[];
  popularity: number;
}

export interface BaitType {
  id: string;
  name: string;
  nameDa: string;
  category: 'natural' | 'prepared' | 'live';
  description: string;
  descriptionDa: string;
  targetSpecies: string[];
  bestSeasons?: string[];
  storage?: string;
  popularity: number;
}

export interface TechniqueType {
  id: string;
  name: string;
  nameDa: string;
  description: string;
  descriptionDa: string;
  methods: FishingMethod[];
  targetSpecies: string[];
  recommendedGear?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SpeciesGearRecommendation {
  speciesId: string;
  speciesName: string;
  recommendedLures: string[];
  recommendedBaits: string[];
  recommendedTechniques: string[];
  recommendedRodType: string;
  recommendedLineStrength: string;
  bestSeason?: string;
  minSize?: string;
  tips?: string[];
}

// =============================================================================
// LURE DATABASE
// =============================================================================

export const LURE_TYPES: LureType[] = [
  // Spinners
  {
    id: 'spinner',
    name: 'Spinner',
    nameDa: 'Spinner',
    category: 'spinner',
    description: 'Metal lure with rotating blade that creates vibrations',
    descriptionDa: 'Metal agn med roterende blad der skaber vibrationer',
    targetSpecies: ['aborre', 'gedde', 'regnbueorred', 'havorred', 'bakorred'],
    recommendedSizes: ['#1', '#2', '#3', '#4', '#5'],
    recommendedColors: ['sølv', 'guld', 'kobber', 'sort', 'chartreuse'],
    techniques: ['steady retrieve', 'stop-and-go'],
    popularity: 9,
  },
  {
    id: 'inline_spinner',
    name: 'Inline Spinner',
    nameDa: 'Inline Spinner',
    category: 'spinner',
    description: 'Classic spinner with blade on wire shaft',
    descriptionDa: 'Klassisk spinner med blad på ståltråd',
    targetSpecies: ['aborre', 'regnbueorred', 'bakorred'],
    recommendedSizes: ['#0', '#1', '#2', '#3'],
    recommendedColors: ['sølv', 'guld', 'sort/gul'],
    techniques: ['upstream cast', 'downstream swing'],
    popularity: 8,
  },

  // Spoons/Blink
  {
    id: 'spoon',
    name: 'Spoon / Blink',
    nameDa: 'Blink',
    category: 'spoon',
    description: 'Metal spoon that wobbles when retrieved',
    descriptionDa: 'Metal blink der vugger ved indspinning',
    targetSpecies: ['havorred', 'gedde', 'laks', 'aborre'],
    recommendedSizes: ['12g', '18g', '22g', '28g', '35g'],
    recommendedColors: ['sølv', 'kobber', 'sort/sølv', 'blå/sølv', 'grøn/sølv'],
    techniques: ['cast and retrieve', 'flutter drop'],
    popularity: 10,
  },
  {
    id: 'casting_spoon',
    name: 'Casting Spoon',
    nameDa: 'Kasteblink',
    category: 'spoon',
    description: 'Heavy spoon designed for long casts',
    descriptionDa: 'Tungt blink designet til lange kast',
    targetSpecies: ['havorred', 'laks', 'havbars'],
    recommendedSizes: ['18g', '22g', '28g', '35g', '40g'],
    recommendedColors: ['sølv', 'sort/sølv', 'blå/sølv'],
    techniques: ['long cast', 'count down'],
    popularity: 9,
  },

  // Wobblers/Plugs
  {
    id: 'wobbler',
    name: 'Wobbler / Crankbait',
    nameDa: 'Wobbler',
    category: 'hardlure',
    description: 'Hard plastic lure with diving lip',
    descriptionDa: 'Hård plastik agn med dykkelæbe',
    targetSpecies: ['gedde', 'sandart', 'aborre', 'havorred'],
    recommendedSizes: ['5cm', '7cm', '9cm', '11cm', '13cm'],
    recommendedColors: ['naturlig', 'firetiger', 'perch', 'pike'],
    techniques: ['trolling', 'cast and retrieve', 'twitching'],
    popularity: 8,
  },
  {
    id: 'jerkbait',
    name: 'Jerkbait',
    nameDa: 'Jerkbait',
    category: 'hardlure',
    description: 'Hard lure designed for jerking action',
    descriptionDa: 'Hård agn designet til jerk-bevægelse',
    targetSpecies: ['gedde', 'sandart'],
    recommendedSizes: ['10cm', '12cm', '15cm', '18cm'],
    recommendedColors: ['naturlig', 'roach', 'perch'],
    techniques: ['jerking', 'glide and pause'],
    popularity: 7,
  },
  {
    id: 'minnow',
    name: 'Minnow / Stickbait',
    nameDa: 'Minnow',
    category: 'hardlure',
    description: 'Slender minnow-shaped hard lure',
    descriptionDa: 'Slank fiskeformet hård agn',
    targetSpecies: ['havorred', 'havbars', 'aborre'],
    recommendedSizes: ['5cm', '7cm', '9cm', '11cm'],
    recommendedColors: ['sølv', 'sandeel', 'naturlig'],
    techniques: ['twitching', 'walking the dog'],
    popularity: 7,
  },
  {
    id: 'popper',
    name: 'Popper',
    nameDa: 'Popper',
    category: 'hardlure',
    description: 'Surface lure that creates popping sound',
    descriptionDa: 'Overflade agn der laver poppende lyd',
    targetSpecies: ['gedde', 'havbars', 'aborre'],
    recommendedSizes: ['6cm', '8cm', '10cm', '12cm'],
    recommendedColors: ['hvid', 'chartreuse', 'naturlig'],
    techniques: ['popping', 'walk the dog'],
    popularity: 6,
  },

  // Soft Lures
  {
    id: 'softbait_shad',
    name: 'Soft Shad',
    nameDa: 'Gummifisk / Shad',
    category: 'softlure',
    description: 'Soft plastic shad with paddle tail',
    descriptionDa: 'Blød plastik shad med paddelhale',
    targetSpecies: ['sandart', 'gedde', 'aborre', 'torsk'],
    recommendedSizes: ['5cm', '7.5cm', '10cm', '12.5cm', '15cm'],
    recommendedColors: ['motoroil', 'chartreuse', 'hvid', 'naturlig', 'pink'],
    techniques: ['jigging', 'slow roll', 'drop shot'],
    popularity: 10,
  },
  {
    id: 'softbait_worm',
    name: 'Soft Worm',
    nameDa: 'Gummiorm',
    category: 'softlure',
    description: 'Soft plastic worm for finesse fishing',
    descriptionDa: 'Blød plastik orm til finesse fiskeri',
    targetSpecies: ['aborre', 'sandart'],
    recommendedSizes: ['7.5cm', '10cm', '12.5cm'],
    recommendedColors: ['lilla', 'grøn pumpkin', 'sort'],
    techniques: ['wacky rig', 'texas rig', 'drop shot'],
    popularity: 7,
  },
  {
    id: 'softbait_creature',
    name: 'Creature Bait',
    nameDa: 'Creature Bait',
    category: 'softlure',
    description: 'Soft plastic with multiple appendages',
    descriptionDa: 'Blød plastik med flere vedhæng',
    targetSpecies: ['aborre', 'sandart', 'gedde'],
    recommendedSizes: ['7.5cm', '10cm', '12.5cm'],
    recommendedColors: ['grøn pumpkin', 'sort/blå', 'craw'],
    techniques: ['texas rig', 'jig trailer'],
    popularity: 6,
  },

  // Jigs
  {
    id: 'jighead',
    name: 'Jighead',
    nameDa: 'Jighoved',
    category: 'jig',
    description: 'Weighted hook for soft plastic lures',
    descriptionDa: 'Vægtet krog til bløde plastik agn',
    targetSpecies: ['sandart', 'aborre', 'gedde', 'torsk'],
    recommendedSizes: ['5g', '7g', '10g', '14g', '21g', '28g'],
    techniques: ['vertical jigging', 'cast and jig'],
    popularity: 10,
  },
  {
    id: 'blade_jig',
    name: 'Blade Jig / Vibration',
    nameDa: 'Bladjig / Vibration',
    category: 'jig',
    description: 'Metal blade that vibrates when retrieved',
    descriptionDa: 'Metal blad der vibrerer ved indspinning',
    targetSpecies: ['sandart', 'aborre', 'gedde'],
    recommendedSizes: ['7g', '10g', '14g', '21g'],
    recommendedColors: ['sølv', 'guld', 'chartreuse'],
    techniques: ['lift and drop', 'fast retrieve'],
    popularity: 7,
  },
  {
    id: 'pilk',
    name: 'Pilk / Pirk',
    nameDa: 'Pilk',
    category: 'jig',
    description: 'Heavy metal jig for sea fishing',
    descriptionDa: 'Tungt metal jig til havfiskeri',
    targetSpecies: ['torsk', 'sej', 'makrel'],
    recommendedSizes: ['40g', '60g', '80g', '100g', '150g'],
    recommendedColors: ['sølv', 'blå/sølv', 'rød/sølv'],
    techniques: ['vertical jigging', 'pirking'],
    popularity: 8,
  },

  // Flies
  {
    id: 'streamer',
    name: 'Streamer',
    nameDa: 'Streamer',
    category: 'fly',
    description: 'Large fly imitating baitfish',
    descriptionDa: 'Stor flue der imiterer bytte fisk',
    targetSpecies: ['havorred', 'laks', 'gedde', 'havbars'],
    recommendedSizes: ['#2', '#4', '#6', '#8'],
    recommendedColors: ['olive', 'sort', 'hvid', 'chartreuse'],
    techniques: ['stripping', 'swing'],
    popularity: 8,
  },
  {
    id: 'nymph',
    name: 'Nymph',
    nameDa: 'Nymfe',
    category: 'fly',
    description: 'Subsurface fly imitating insect larvae',
    descriptionDa: 'Undervands flue der imiterer insektlarver',
    targetSpecies: ['bakorred', 'regnbueorred', 'stalling'],
    recommendedSizes: ['#10', '#12', '#14', '#16'],
    techniques: ['dead drift', 'euro nymphing'],
    popularity: 7,
  },
  {
    id: 'dry_fly',
    name: 'Dry Fly',
    nameDa: 'Tørflue',
    category: 'fly',
    description: 'Surface fly imitating adult insects',
    descriptionDa: 'Overflade flue der imiterer voksne insekter',
    targetSpecies: ['bakorred', 'regnbueorred', 'stalling'],
    recommendedSizes: ['#12', '#14', '#16', '#18'],
    techniques: ['dead drift', 'skating'],
    popularity: 6,
  },
  {
    id: 'coastal_fly',
    name: 'Coastal Fly',
    nameDa: 'Kystflue',
    category: 'fly',
    description: 'Fly designed for coastal sea trout fishing',
    descriptionDa: 'Flue designet til kystfiskeri efter havørred',
    targetSpecies: ['havorred', 'havbars'],
    recommendedSizes: ['#4', '#6', '#8'],
    recommendedColors: ['sort', 'olive', 'pink', 'chartreuse'],
    techniques: ['stripping', 'slow retrieve'],
    popularity: 9,
  },

  // Special
  {
    id: 'bombarda',
    name: 'Bombarda Float',
    nameDa: 'Bombarda',
    category: 'hardlure',
    description: 'Weighted float for casting flies with spinning gear',
    descriptionDa: 'Vægtet flåd til at kaste fluer med spinneudstyr',
    targetSpecies: ['havorred', 'regnbueorred', 'hornfisk'],
    recommendedSizes: ['10g', '15g', '20g', '25g', '30g'],
    techniques: ['slow retrieve', 'stop and go'],
    popularity: 7,
  },
  {
    id: 'sild_blink',
    name: 'Herring Lure / Sildeblink',
    nameDa: 'Sildeblink',
    category: 'spoon',
    description: 'Long thin spoon imitating herring',
    descriptionDa: 'Langt tyndt blink der imiterer sild',
    targetSpecies: ['hornfisk', 'makrel', 'havorred'],
    recommendedSizes: ['15g', '20g', '28g'],
    recommendedColors: ['sølv', 'blå/sølv'],
    techniques: ['fast retrieve', 'jerking'],
    popularity: 8,
  },
  {
    id: 'kondom_spinner',
    name: 'Kondom Spinner',
    nameDa: 'Kondomspinner',
    category: 'spinner',
    description: 'Spinner with soft rubber body for salmon fishing',
    descriptionDa: 'Spinner med blød gummikrop til laksefiskeri',
    targetSpecies: ['laks', 'havorred'],
    recommendedSizes: ['15g', '18g', '20g', '25g'],
    recommendedColors: ['orange', 'sort', 'chartreuse', 'pink'],
    techniques: ['cast and retrieve', 'slow roll'],
    popularity: 7,
  },
  {
    id: 'makrel_forfang',
    name: 'Mackerel Rig',
    nameDa: 'Makrelforfang',
    category: 'jig',
    description: 'Multi-hook rig for catching mackerel in schools',
    descriptionDa: 'Flere-krogs forfang til fangst af makrel i stimer',
    targetSpecies: ['makrel'],
    recommendedSizes: ['5-7 kroge'],
    recommendedColors: ['sølv', 'grøn', 'blå'],
    techniques: ['vertical jigging', 'cast and retrieve'],
    popularity: 9,
  },
  {
    id: 'silde_forfang',
    name: 'Herring Rig',
    nameDa: 'Sildeforfang',
    category: 'jig',
    description: 'Multi-hook rig for catching herring',
    descriptionDa: 'Flere-krogs forfang til sildefiskeri',
    targetSpecies: ['sild'],
    recommendedSizes: ['6-8 kroge'],
    techniques: ['vertical jigging'],
    popularity: 7,
  },
  {
    id: 'hornfisk_snare',
    name: 'Garfish Silk Snare',
    nameDa: 'Hornfisk silkeforfang',
    category: 'hardlure',
    description: 'Silk snares that wrap around garfish beak - no hooks needed',
    descriptionDa: 'Silkesnører der vikler sig om hornfiskens næb - ingen kroge nødvendige',
    targetSpecies: ['hornfisk'],
    recommendedColors: ['rød', 'grøn', 'sort'],
    techniques: ['fast retrieve'],
    popularity: 8,
  },
  {
    id: 'paternoster_rig',
    name: 'Paternoster Rig',
    nameDa: 'Paternoster',
    category: 'jig',
    description: 'Bottom fishing rig with multiple hooks on booms',
    descriptionDa: 'Bundfiskeri forfang med flere kroge på arme',
    targetSpecies: ['fladfisk', 'torsk'],
    recommendedSizes: ['40-60g vægt'],
    techniques: ['bottom fishing', 'stationary'],
    popularity: 8,
  },
  {
    id: 'drag_tackle',
    name: 'Drag Tackle',
    nameDa: 'Trækforfang',
    category: 'jig',
    description: 'Active bottom fishing rig with trailing hook',
    descriptionDa: 'Aktivt bundforfang med hængende krog',
    targetSpecies: ['fladfisk'],
    techniques: ['slow drag', 'active bottom fishing'],
    popularity: 7,
  },

  // Brand-specific lures (from Effektlageret)
  {
    id: 'rapala_countdown',
    name: 'Rapala Countdown',
    nameDa: 'Rapala Countdown',
    category: 'hardlure',
    description: 'Classic sinking wobbler that counts down to desired depth',
    descriptionDa: 'Klassisk synkende wobbler der tælles ned til ønsket dybde',
    targetSpecies: ['gedde', 'havorred', 'aborre', 'sandart'],
    recommendedSizes: ['5cm', '7cm', '9cm', '11cm'],
    techniques: ['count down', 'slow retrieve'],
    popularity: 9,
  },
  {
    id: 'abu_atom',
    name: 'ABU Atom',
    nameDa: 'ABU Atom',
    category: 'spoon',
    description: 'Classic Swedish spoon lure, proven for decades',
    descriptionDa: 'Klassisk svensk blink, testet i årtier',
    targetSpecies: ['gedde', 'havorred', 'laks'],
    recommendedSizes: ['18g', '25g', '35g'],
    recommendedColors: ['sølv', 'kobber', 'guld'],
    techniques: ['cast and retrieve'],
    popularity: 9,
  },
  {
    id: 'savage_gear_shad',
    name: 'Savage Gear Shad',
    nameDa: 'Savage Gear Gummifisk',
    category: 'softlure',
    description: 'Premium soft plastic shads from Danish brand',
    descriptionDa: 'Premium gummifisk fra dansk mærke',
    targetSpecies: ['sandart', 'gedde', 'torsk', 'aborre'],
    recommendedSizes: ['7.5cm', '10cm', '12.5cm', '15cm', '20cm'],
    techniques: ['jigging', 'slow roll'],
    popularity: 10,
  },
  {
    id: 'rapala_harmaja',
    name: 'Rapala Harmaja',
    nameDa: 'Rapala Harmaja',
    category: 'spoon',
    description: 'Finnish spoon lure for coastal fishing',
    descriptionDa: 'Finsk blink til kystfiskeri',
    targetSpecies: ['havorred', 'laks'],
    recommendedSizes: ['18g', '22g', '28g'],
    recommendedColors: ['sølv', 'sølv/blå', 'kobber'],
    techniques: ['cast and retrieve', 'count down'],
    popularity: 8,
  },
  {
    id: 'through_liner',
    name: 'Through-Liner',
    nameDa: 'Gennemløber',
    category: 'spoon',
    description: 'Line-through spoon preventing self-hooking',
    descriptionDa: 'Gennemløber blink der forhindrer selv-krokning',
    targetSpecies: ['havorred', 'laks'],
    recommendedSizes: ['15g', '18g', '22g', '28g'],
    techniques: ['cast and retrieve'],
    popularity: 8,
  },
  {
    id: 'micro_blink',
    name: 'Micro Spoon',
    nameDa: 'Mikroblink',
    category: 'spoon',
    description: 'Ultra-light spoon for trout in put-and-take',
    descriptionDa: 'Ultra-let blink til ørred i put-and-take',
    targetSpecies: ['regnbueorred'],
    recommendedSizes: ['2g', '3g', '5g', '7g'],
    techniques: ['slow retrieve', 'count down'],
    popularity: 8,
  },

  // Rig types (from Effektlageret carp & predator fishing)
  {
    id: 'texas_rig',
    name: 'Texas Rig',
    nameDa: 'Texas Rig',
    category: 'jig',
    description: 'Weedless rig with bullet weight and offset hook',
    descriptionDa: 'Ukrudtsfri rig med bullet vægt og offset krog',
    targetSpecies: ['aborre', 'sandart', 'havbars'],
    techniques: ['bottom fishing', 'cover fishing'],
    popularity: 8,
  },
  {
    id: 'carolina_rig',
    name: 'Carolina Rig',
    nameDa: 'Carolina Rig',
    category: 'jig',
    description: 'Bottom rig with leader separating weight from hook',
    descriptionDa: 'Bundrig med fortom der adskiller vægt fra krog',
    targetSpecies: ['aborre', 'sandart', 'havbars'],
    techniques: ['bottom fishing', 'slow drag'],
    popularity: 7,
  },
  {
    id: 'cheburaska',
    name: 'Cheburashka',
    nameDa: 'Cheburaska',
    category: 'jig',
    description: 'Ball-shaped jig head with detachable hook',
    descriptionDa: 'Kugleformet jighoved med aftagelig krog',
    targetSpecies: ['aborre', 'sandart', 'regnbueorred'],
    recommendedSizes: ['3g', '5g', '7g', '10g', '14g'],
    techniques: ['jigging', 'slow roll'],
    popularity: 7,
  },
  {
    id: 'weedless_jig',
    name: 'Weedless Jig',
    nameDa: 'Ukrudtsfri Jig',
    category: 'jig',
    description: 'Jig head with wire guard preventing snags',
    descriptionDa: 'Jighoved med trådbeskyttelse mod hængninger',
    targetSpecies: ['havbars', 'aborre', 'gedde'],
    recommendedSizes: ['15g', '20g', '25g'],
    techniques: ['cover fishing'],
    popularity: 7,
  },

  // Carp rigs
  {
    id: 'hair_rig',
    name: 'Hair Rig',
    nameDa: 'Hårrig',
    category: 'jig',
    description: 'Carp rig with bait on extended line from hook',
    descriptionDa: 'Karperig med agn på forlænget line fra krogen',
    targetSpecies: ['karpe'],
    techniques: ['bottom fishing'],
    popularity: 9,
  },
  {
    id: 'leadclip_rig',
    name: 'Lead Clip Rig',
    nameDa: 'Leadclip',
    category: 'jig',
    description: 'Rig with detachable weight for soft bottom',
    descriptionDa: 'Rig med aftagelig vægt til blød bund',
    targetSpecies: ['karpe'],
    techniques: ['bottom fishing'],
    popularity: 8,
  },
  {
    id: 'helicopter_rig',
    name: 'Helicopter Rig',
    nameDa: 'Helikopterrig',
    category: 'jig',
    description: 'Rig with hook above weight, prevents silt penetration',
    descriptionDa: 'Rig med krog over vægt, forhindrer nedsynkning i mudder',
    targetSpecies: ['karpe'],
    techniques: ['bottom fishing'],
    popularity: 7,
  },
  {
    id: 'chod_rig',
    name: 'Chod Rig',
    nameDa: 'Chodrig',
    category: 'jig',
    description: 'Extended rig for vegetation-heavy waters',
    descriptionDa: 'Forlænget rig til farvande med meget vegetation',
    targetSpecies: ['karpe'],
    techniques: ['bottom fishing'],
    popularity: 7,
  },
];

// =============================================================================
// BAIT DATABASE
// =============================================================================

export const BAIT_TYPES: BaitType[] = [
  // Natural Baits
  {
    id: 'earthworm',
    name: 'Earthworm',
    nameDa: 'Regnorm',
    category: 'natural',
    description: 'Classic bait for most freshwater species',
    descriptionDa: 'Klassisk agn til de fleste ferskvandsfisk',
    targetSpecies: ['aborre', 'skalle', 'brasen', 'al', 'karpe'],
    bestSeasons: ['forår', 'sommer', 'efterår'],
    storage: 'Køligt og fugtigt',
    popularity: 10,
  },
  {
    id: 'nightcrawler',
    name: 'Nightcrawler',
    nameDa: 'Stor regnorm / Tauworm',
    category: 'natural',
    description: 'Large earthworm for bigger fish',
    descriptionDa: 'Stor regnorm til større fisk',
    targetSpecies: ['al', 'sandart', 'aborre', 'karpe'],
    bestSeasons: ['forår', 'sommer', 'efterår'],
    storage: 'Køligt og fugtigt',
    popularity: 8,
  },
  {
    id: 'maggot',
    name: 'Maggot',
    nameDa: 'Maddike',
    category: 'natural',
    description: 'Small larvae bait for coarse fishing',
    descriptionDa: 'Små larver til fredfiskeri',
    targetSpecies: ['skalle', 'brasen', 'suder', 'aborre'],
    bestSeasons: ['forår', 'sommer', 'efterår'],
    storage: 'Køleskab',
    popularity: 9,
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    nameDa: 'Rejer',
    category: 'natural',
    description: 'Excellent saltwater bait',
    descriptionDa: 'Fremragende saltvands agn',
    targetSpecies: ['torsk', 'fladfisk', 'havbars', 'multe'],
    bestSeasons: ['hele året'],
    storage: 'Fryser eller køl',
    popularity: 9,
  },
  {
    id: 'sandworm',
    name: 'Sandworm / Lugworm',
    nameDa: 'Sandorm / Børsteorm',
    category: 'natural',
    description: 'Classic sea fishing bait',
    descriptionDa: 'Klassisk havfiskeri agn',
    targetSpecies: ['fladfisk', 'torsk', 'al'],
    bestSeasons: ['hele året'],
    storage: 'Køligt, brug hurtigt',
    popularity: 8,
  },
  {
    id: 'mussel',
    name: 'Mussel',
    nameDa: 'Musling',
    category: 'natural',
    description: 'Excellent for flatfish and wrasse',
    descriptionDa: 'Fremragende til fladfisk',
    targetSpecies: ['fladfisk', 'torsk'],
    bestSeasons: ['hele året'],
    popularity: 7,
  },
  {
    id: 'mackerel',
    name: 'Mackerel (cut)',
    nameDa: 'Makrelstykker',
    category: 'natural',
    description: 'Oily bait for predators',
    descriptionDa: 'Fedtholdigt agn til rovfisk',
    targetSpecies: ['torsk', 'havbars', 'al'],
    bestSeasons: ['hele året'],
    storage: 'Fryser',
    popularity: 7,
  },
  {
    id: 'herring',
    name: 'Herring (cut)',
    nameDa: 'Sildestykker',
    category: 'natural',
    description: 'Classic bait for sea fishing',
    descriptionDa: 'Klassisk agn til havfiskeri',
    targetSpecies: ['torsk', 'fladfisk'],
    bestSeasons: ['hele året'],
    storage: 'Fryser',
    popularity: 7,
  },

  // Prepared Baits
  {
    id: 'bread',
    name: 'Bread',
    nameDa: 'Brød',
    category: 'prepared',
    description: 'Simple and effective for coarse fish',
    descriptionDa: 'Simpelt og effektivt til fredfisk',
    targetSpecies: ['skalle', 'brasen', 'karpe', 'suder'],
    bestSeasons: ['sommer', 'efterår'],
    popularity: 8,
  },
  {
    id: 'corn',
    name: 'Sweet Corn',
    nameDa: 'Majs',
    category: 'prepared',
    description: 'Sweet corn for carp and coarse fish',
    descriptionDa: 'Sød majs til karpe og fredfisk',
    targetSpecies: ['karpe', 'skalle', 'brasen', 'suder'],
    bestSeasons: ['sommer', 'efterår'],
    popularity: 9,
  },
  {
    id: 'boilie',
    name: 'Boilie',
    nameDa: 'Boilie',
    category: 'prepared',
    description: 'Round bait ball for carp fishing',
    descriptionDa: 'Rund agn kugle til karpefiskeri',
    targetSpecies: ['karpe'],
    bestSeasons: ['forår', 'sommer', 'efterår'],
    popularity: 8,
  },
  {
    id: 'pellet',
    name: 'Pellet',
    nameDa: 'Pellets',
    category: 'prepared',
    description: 'Compressed bait pellets',
    descriptionDa: 'Komprimerede agn pellets',
    targetSpecies: ['karpe', 'regnbueorred', 'skalle'],
    bestSeasons: ['hele året'],
    popularity: 7,
  },
  {
    id: 'dough',
    name: 'Dough / Paste',
    nameDa: 'Dej / Pasta',
    category: 'prepared',
    description: 'Moldable bait for various fish',
    descriptionDa: 'Formbar agn til forskellige fisk',
    targetSpecies: ['skalle', 'brasen', 'karpe', 'regnbueorred'],
    bestSeasons: ['hele året'],
    popularity: 7,
  },
  {
    id: 'powerbait',
    name: 'PowerBait',
    nameDa: 'PowerBait',
    category: 'prepared',
    description: 'Scented floating dough for trout',
    descriptionDa: 'Duftende flydende dej til ørred',
    targetSpecies: ['regnbueorred'],
    bestSeasons: ['hele året'],
    popularity: 9,
  },

  // Live Baits
  {
    id: 'livebait_roach',
    name: 'Live Roach',
    nameDa: 'Levende skalle',
    category: 'live',
    description: 'Live baitfish for pike',
    descriptionDa: 'Levende agnfisk til gedde',
    targetSpecies: ['gedde', 'sandart'],
    bestSeasons: ['efterår', 'vinter'],
    storage: 'Iltet beholder',
    popularity: 6,
  },
  {
    id: 'livebait_minnow',
    name: 'Live Minnow',
    nameDa: 'Levende elritse',
    category: 'live',
    description: 'Small live baitfish',
    descriptionDa: 'Små levende agnfisk',
    targetSpecies: ['aborre', 'sandart'],
    bestSeasons: ['hele året'],
    storage: 'Iltet beholder',
    popularity: 5,
  },
  {
    id: 'tobis',
    name: 'Sand Eel / Tobis',
    nameDa: 'Tobis',
    category: 'natural',
    description: 'Sand eel - primary prey for sea trout',
    descriptionDa: 'Tobis - primært bytte for havørred',
    targetSpecies: ['havorred', 'havbars', 'torsk'],
    bestSeasons: ['forår', 'sommer', 'efterår'],
    storage: 'Fryser',
    popularity: 8,
  },
  {
    id: 'borsteorm',
    name: 'Bristle Worm',
    nameDa: 'Børsteorm',
    category: 'natural',
    description: 'Marine worm excellent for flatfish and cod',
    descriptionDa: 'Havorm fremragende til fladfisk og torsk',
    targetSpecies: ['fladfisk', 'torsk', 'havorred'],
    bestSeasons: ['hele året'],
    storage: 'Køligt, brug hurtigt',
    popularity: 9,
  },
  {
    id: 'gulp',
    name: 'GULP / Artificial Bait',
    nameDa: 'GULP kunstagn',
    category: 'prepared',
    description: 'Scented artificial bait that mimics natural baits',
    descriptionDa: 'Duftende kunstagn der efterligner naturligt agn',
    targetSpecies: ['fladfisk', 'torsk', 'regnbueorred'],
    bestSeasons: ['hele året'],
    popularity: 7,
  },
  {
    id: 'tanglopper',
    name: 'Amphipods',
    nameDa: 'Tanglopper',
    category: 'natural',
    description: 'Small crustaceans found in seaweed',
    descriptionDa: 'Små krebsdyr fundet i tang',
    targetSpecies: ['havorred', 'multe'],
    bestSeasons: ['forår', 'sommer'],
    popularity: 5,
  },
];

// =============================================================================
// TECHNIQUE DATABASE
// =============================================================================

export const TECHNIQUES: TechniqueType[] = [
  {
    id: 'spinning',
    name: 'Spinning',
    nameDa: 'Spinnefiskeri',
    description: 'Cast and retrieve with spinning gear',
    descriptionDa: 'Kast og indhentning med spinneudstyr',
    methods: ['spinning'],
    targetSpecies: ['aborre', 'gedde', 'havorred', 'sandart', 'havbars'],
    recommendedGear: ['spinner', 'spoon', 'softbait_shad', 'wobbler'],
    difficulty: 'beginner',
  },
  {
    id: 'jigging',
    name: 'Jigging',
    nameDa: 'Jigfiskeri',
    description: 'Vertical or cast jigging with soft plastics',
    descriptionDa: 'Vertikalt eller kast jigging med gummifisk',
    methods: ['jigging'],
    targetSpecies: ['sandart', 'aborre', 'torsk', 'gedde'],
    recommendedGear: ['jighead', 'softbait_shad', 'pilk'],
    difficulty: 'intermediate',
  },
  {
    id: 'fly_fishing',
    name: 'Fly Fishing',
    nameDa: 'Fluefiskeri',
    description: 'Casting flies with specialized fly gear',
    descriptionDa: 'Kast med fluer ved brug af fluegrej',
    methods: ['fly'],
    targetSpecies: ['havorred', 'laks', 'bakorred', 'regnbueorred', 'stalling'],
    recommendedGear: ['streamer', 'nymph', 'dry_fly', 'coastal_fly'],
    difficulty: 'advanced',
  },
  {
    id: 'float_fishing',
    name: 'Float Fishing',
    nameDa: 'Flådfiskeri',
    description: 'Fishing with float and natural bait',
    descriptionDa: 'Fiskeri med flåd og naturligt agn',
    methods: ['float'],
    targetSpecies: ['skalle', 'brasen', 'aborre', 'suder', 'karpe'],
    recommendedGear: ['earthworm', 'maggot', 'bread', 'corn'],
    difficulty: 'beginner',
  },
  {
    id: 'bottom_fishing',
    name: 'Bottom Fishing',
    nameDa: 'Bundfiskeri',
    description: 'Fishing with weight on the bottom',
    descriptionDa: 'Fiskeri med vægt på bunden',
    methods: ['bottom'],
    targetSpecies: ['al', 'karpe', 'fladfisk', 'torsk'],
    recommendedGear: ['earthworm', 'sandworm', 'shrimp', 'boilie'],
    difficulty: 'beginner',
  },
  {
    id: 'trolling',
    name: 'Trolling',
    nameDa: 'Trolling / Dorge',
    description: 'Dragging lures behind a moving boat',
    descriptionDa: 'Trække agn efter en båd i bevægelse',
    methods: ['trolling'],
    targetSpecies: ['laks', 'havorred', 'gedde'],
    recommendedGear: ['wobbler', 'spoon'],
    difficulty: 'intermediate',
  },
  {
    id: 'dropshot',
    name: 'Drop Shot',
    nameDa: 'Drop Shot',
    description: 'Finesse technique with weight below hook',
    descriptionDa: 'Finesse teknik med vægt under krogen',
    methods: ['dropshot'],
    targetSpecies: ['aborre', 'sandart'],
    recommendedGear: ['softbait_worm', 'softbait_shad'],
    difficulty: 'intermediate',
  },
  {
    id: 'bombarda_fishing',
    name: 'Bombarda Fishing',
    nameDa: 'Bombardafiskeri',
    description: 'Casting flies with weighted float',
    descriptionDa: 'Kast fluer med vægtet flåd',
    methods: ['spinning'],
    targetSpecies: ['havorred', 'regnbueorred', 'hornfisk'],
    recommendedGear: ['bombarda', 'coastal_fly', 'streamer'],
    difficulty: 'intermediate',
  },
  {
    id: 'surface_fishing',
    name: 'Surface / Topwater',
    nameDa: 'Overfladefiskeri',
    description: 'Fishing with surface lures',
    descriptionDa: 'Fiskeri med overfladeagn',
    methods: ['spinning'],
    targetSpecies: ['gedde', 'havbars', 'aborre'],
    recommendedGear: ['popper', 'wobbler'],
    difficulty: 'intermediate',
  },
];

// =============================================================================
// SPECIES GEAR RECOMMENDATIONS
// =============================================================================

export const SPECIES_GEAR_RECOMMENDATIONS: SpeciesGearRecommendation[] = [
  {
    speciesId: 'aborre',
    speciesName: 'Aborre',
    recommendedLures: ['spinner', 'softbait_shad', 'jighead', 'blade_jig'],
    recommendedBaits: ['earthworm', 'maggot'],
    recommendedTechniques: ['spinning', 'jigging', 'dropshot', 'float_fishing'],
    recommendedRodType: 'Let-medium spinning 5-20g',
    recommendedLineStrength: 'Fletline 0.10-0.14mm / Mono 0.20-0.25mm',
    tips: [
      'Aborre reagerer godt på vibrationer - brug spinner eller blade jig',
      'Mindre agn giver ofte flere fisk',
      'Morgen og aften er bedste tider',
    ],
  },
  {
    speciesId: 'gedde',
    speciesName: 'Gedde',
    recommendedLures: ['wobbler', 'jerkbait', 'softbait_shad', 'spoon', 'spinner', 'popper'],
    recommendedBaits: ['livebait_roach'],
    recommendedTechniques: ['spinning', 'jigging', 'trolling', 'surface_fishing'],
    recommendedRodType: '8-10ft med 40g kastevægt',
    recommendedLineStrength: 'Fletline 0.17-0.20mm med stål/fluor fortom',
    bestSeason: 'Fra maj (efter gydning) hele året',
    tips: [
      'ALTID stål eller tykt fluorcarbon fortom - skarpe tænder!',
      'Varier indspinningshastighed efter sæson - langsommere i kolde måneder',
      'Trolling: Træk agn 15-30m bag båd, fisk flere dybder',
      'Fluefiskeri: Lette syntetiske fluer på #6-8 flueklasse',
      'Store agn til store fisk',
    ],
  },
  {
    speciesId: 'sandart',
    speciesName: 'Sandart',
    recommendedLures: ['softbait_shad', 'jighead', 'wobbler', 'blade_jig'],
    recommendedBaits: ['livebait_roach', 'livebait_minnow'],
    recommendedTechniques: ['jigging', 'dropshot', 'trolling'],
    recommendedRodType: '8-10ft med 30-40g kastevægt, følsom top',
    recommendedLineStrength: 'Fletline 0.14-0.18mm med min. 0.50mm fluor fortom',
    bestSeason: 'Forår til efterår (mest aktiv)',
    tips: [
      'Sandart jager primært i skumring og nat',
      'Vertikal jigging med ekkolod er effektivt',
      'Min. 0.50mm fluorcarbon eller mono fortom',
      'Langsom jigging er ofte effektivt',
      'Brug naturlige farver i klart vand',
    ],
  },
  {
    speciesId: 'havorred',
    speciesName: 'Havørred',
    recommendedLures: ['spoon', 'coastal_fly', 'bombarda', 'minnow', 'sild_blink'],
    recommendedBaits: ['shrimp', 'borsteorm', 'tobis'],
    recommendedTechniques: ['spinning', 'fly_fishing', 'bombarda_fishing'],
    recommendedRodType: 'Kystspinning 9ft 5-30g / Flueklasse #5-7',
    recommendedLineStrength: 'Fletline 0.12-0.17mm / Flueline floating/intermediate',
    bestSeason: 'Forår (peak), sommer (natfiskeri), efterår, vinter (bonanza)',
    tips: [
      'Bevæg dig mellem kastepladserne - tålmodighed belønnes',
      'Forår: Fiskene spredes langs kysten efter føde',
      'Sommer: Natfiskeri med flydeline er produktivt',
      'Vinter: Find fiskene i flokke - kan give bonanza-fiskeri',
      'Efterlign naturlige byttedyr: børsteorm, tobis, rejer, tanglopper',
    ],
  },
  {
    speciesId: 'laks',
    speciesName: 'Laks',
    recommendedLures: ['kondom_spinner', 'spoon', 'wobbler', 'streamer'],
    recommendedBaits: [],
    recommendedTechniques: ['fly_fishing', 'spinning', 'trolling'],
    recommendedRodType: 'Spinning 10ft op til 30g / Switch/2-hånds flueklasse #7-9',
    recommendedLineStrength: 'Mono 0.35mm / Fletline 0.17-0.20mm',
    bestSeason: 'Maj-Oktober (prime: juni-september)',
    tips: [
      'Kondomspinner 15-25g er effektiv tidligt på sæsonen',
      'Lettere agn senere på sæsonen',
      'Bedst når regn får åen til at stige',
      'Overskyet vejr og aften/nat er optimalt',
      'Undgå varme perioder - laks foretrækker køligere vand',
    ],
  },
  {
    speciesId: 'torsk',
    speciesName: 'Torsk',
    recommendedLures: ['pilk', 'softbait_shad', 'jighead', 'spoon'],
    recommendedBaits: ['shrimp', 'borsteorm', 'mackerel', 'herring', 'mussel'],
    recommendedTechniques: ['jigging', 'bottom_fishing'],
    recommendedRodType: 'Mole/kyst: 7-9ft 40g / Båd: 100-300g pilkestang',
    recommendedLineStrength: 'Fletline ~0.17mm / Mono max 0.30mm',
    bestSeason: 'Efterår, vinter, forår (højsæson)',
    minSize: 'Nordsøen/Limfjord: 35cm, Skagerrak/Kattegat: 30cm, Bælter/Østersø: 35cm',
    tips: [
      'Kast og lad agn synke til bunden',
      'Langsom indspinning med jerk fra stangspidsen',
      'Lad agn falde tilbage mod bunden gentagne gange',
      'Gummifisk med opadvendte kroge reducerer hægtning',
      'Medbring tang - torsk sluger agn dybt',
    ],
  },
  {
    speciesId: 'skalle',
    speciesName: 'Skalle',
    recommendedLures: [],
    recommendedBaits: ['bread', 'corn', 'maggot', 'earthworm'],
    recommendedTechniques: ['float_fishing'],
    recommendedRodType: 'Let matchstang eller telestang',
    recommendedLineStrength: 'Mono 0.14-0.18mm',
    tips: [
      'Simpelt og godt for begyndere',
      'Brug grundfoder til at lokke fiskene',
      'Størrelse 10-14 kroge',
    ],
  },
  {
    speciesId: 'karpe',
    speciesName: 'Karpe',
    recommendedLures: [],
    recommendedBaits: ['boilie', 'corn', 'bread', 'pellet', 'dough'],
    recommendedTechniques: ['bottom_fishing'],
    recommendedRodType: 'Karpestang 2.75-3.5lb',
    recommendedLineStrength: 'Mono 0.30-0.35mm / Fletline 0.20mm',
    tips: [
      'Tålmodighed er nøglen',
      'Forfodring øger chancerne markant',
      'Sommer og tidligt efterår er bedst',
    ],
  },
  {
    speciesId: 'hornfisk',
    speciesName: 'Hornfisk',
    recommendedLures: ['sild_blink', 'hornfisk_snare', 'bombarda'],
    recommendedBaits: [],
    recommendedTechniques: ['spinning', 'bombarda_fishing'],
    recommendedRodType: 'Spinnestang 10-40g, hjul str. 3000-4000',
    recommendedLineStrength: 'Fletline ca. 10kg bæreevne',
    bestSeason: 'Maj-Juli (gydning i sen forår)',
    tips: [
      'Brug blink med silkesnører der vikler sig om næbbet',
      'Ingen kroge nødvendige - børnevenligt!',
      'Hornfisk svømmer i stimer tæt på kysten',
      'Del af "Jysk Grand Slam" (hornfisk, makrel, sild)',
      'Tidlig morgen og sen aften er bedst',
    ],
  },
  {
    speciesId: 'makrel',
    speciesName: 'Makrel',
    recommendedLures: ['makrel_forfang', 'pilk', 'sild_blink', 'spinner'],
    recommendedBaits: ['shrimp', 'mackerel', 'herring'],
    recommendedTechniques: ['jigging', 'spinning'],
    recommendedRodType: 'Spinnestang 10-40g, hjul str. 3000-4000',
    recommendedLineStrength: 'Fletline ca. 10kg bæreevne',
    bestSeason: 'Sommer (peak i mid-august)',
    tips: [
      'Makrel jager i store stimer',
      'Makrelforfang kan give flere fisk samtidigt',
      'Større fisk: Prøv flåd med sildestyker i varierende dybder',
      'Mest aktive tidlig morgen og sen aften',
      'Del af "Jysk Grand Slam" (hornfisk, makrel, sild)',
    ],
  },
  {
    speciesId: 'regnbueorred',
    speciesName: 'Regnbueørred',
    recommendedLures: ['spinner', 'spoon', 'bombarda'],
    recommendedBaits: ['powerbait', 'corn', 'dough', 'earthworm'],
    recommendedTechniques: ['spinning', 'float_fishing', 'bombarda_fishing'],
    recommendedRodType: 'Let spinning 5-20g',
    recommendedLineStrength: 'Mono 0.22-0.28mm',
    tips: [
      'PowerBait er effektivt i put-and-take søer',
      'Variér indhentningshastighed',
      'Fisk tit ved bunden',
    ],
  },
  {
    speciesId: 'fladfisk',
    speciesName: 'Fladfisk',
    recommendedLures: ['paternoster_rig', 'drag_tackle'],
    recommendedBaits: ['borsteorm', 'sandworm', 'shrimp', 'mussel', 'gulp'],
    recommendedTechniques: ['bottom_fishing'],
    recommendedRodType: 'Mole/båd: 60-100g / Kyst: 20-40g kastevægt',
    recommendedLineStrength: 'Fletline 0.15-0.25mm / Mono 0.35-0.45mm',
    bestSeason: 'Sen sommer til efterår (vand over 10°C)',
    tips: [
      'Aktivt fiskeri - spin langsomt langs bunden',
      'Fladfisk jager mere aktivt end man troede',
      'Farverige forfang med spinnerblad øger synlighed',
      'Paternoster: stationært, Trækforfang: aktivt',
      'GULP kunstagn er blevet populære alternativer',
    ],
  },
  {
    speciesId: 'sild',
    speciesName: 'Sild',
    recommendedLures: ['silde_forfang', 'pilk'],
    recommendedBaits: [],
    recommendedTechniques: ['jigging'],
    recommendedRodType: 'Spinnestang 10-40g, hjul str. 3000-4000',
    recommendedLineStrength: 'Fletline ca. 10kg bæreevne',
    bestSeason: 'Forår og hele sæsonen fra moler',
    tips: [
      'Brug sildeforfang med tungt blink/vægt',
      'Silden findes dybere i vandet',
      'Ofte fra moler og havne',
      'Del af "Jysk Grand Slam" (sild, makrel, hornfisk)',
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all lures suitable for a species
 */
export const getLuresForSpecies = (speciesId: string): LureType[] => {
  return LURE_TYPES.filter(lure =>
    lure.targetSpecies.includes(speciesId)
  ).sort((a, b) => b.popularity - a.popularity);
};

/**
 * Get all baits suitable for a species
 */
export const getBaitsForSpecies = (speciesId: string): BaitType[] => {
  return BAIT_TYPES.filter(bait =>
    bait.targetSpecies.includes(speciesId)
  ).sort((a, b) => b.popularity - a.popularity);
};

/**
 * Get techniques suitable for a species
 */
export const getTechniquesForSpecies = (speciesId: string): TechniqueType[] => {
  return TECHNIQUES.filter(tech =>
    tech.targetSpecies.includes(speciesId)
  );
};

/**
 * Get gear recommendations for a species
 */
export const getGearRecommendation = (speciesId: string): SpeciesGearRecommendation | undefined => {
  return SPECIES_GEAR_RECOMMENDATIONS.find(rec => rec.speciesId === speciesId);
};

/**
 * Get all lures by category
 */
export const getLuresByCategory = (category: LureType['category']): LureType[] => {
  return LURE_TYPES.filter(lure => lure.category === category)
    .sort((a, b) => b.popularity - a.popularity);
};

/**
 * Get all baits by category
 */
export const getBaitsByCategory = (category: BaitType['category']): BaitType[] => {
  return BAIT_TYPES.filter(bait => bait.category === category)
    .sort((a, b) => b.popularity - a.popularity);
};

/**
 * Search for lures/baits by name
 */
export const searchGear = (query: string): { lures: LureType[]; baits: BaitType[] } => {
  const q = query.toLowerCase();
  return {
    lures: LURE_TYPES.filter(lure =>
      lure.name.toLowerCase().includes(q) ||
      lure.nameDa.toLowerCase().includes(q)
    ),
    baits: BAIT_TYPES.filter(bait =>
      bait.name.toLowerCase().includes(q) ||
      bait.nameDa.toLowerCase().includes(q)
    ),
  };
};

/**
 * Get all lure names for dropdown (Danish)
 */
export const getAllLureNamesDa = (): string[] => {
  return LURE_TYPES.map(lure => lure.nameDa).sort();
};

/**
 * Get all bait names for dropdown (Danish)
 */
export const getAllBaitNamesDa = (): string[] => {
  return BAIT_TYPES.map(bait => bait.nameDa).sort();
};

/**
 * Get all technique names for dropdown (Danish)
 */
export const getAllTechniqueNamesDa = (): string[] => {
  return TECHNIQUES.map(tech => tech.nameDa).sort();
};

/**
 * Get combined lure + bait list for catch form dropdown
 */
export const getAllGearForDropdown = (): Array<{ id: string; name: string; type: 'lure' | 'bait' }> => {
  const lures = LURE_TYPES.map(lure => ({
    id: lure.id,
    name: lure.nameDa,
    type: 'lure' as const,
  }));

  const baits = BAIT_TYPES.map(bait => ({
    id: bait.id,
    name: bait.nameDa,
    type: 'bait' as const,
  }));

  return [...lures, ...baits].sort((a, b) => a.name.localeCompare(b.name, 'da'));
};

/**
 * Get smart gear suggestions based on species and method
 */
export const getSmartGearSuggestions = (
  speciesId?: string,
  method?: FishingMethod
): { lures: LureType[]; baits: BaitType[]; techniques: TechniqueType[] } => {
  let lures = [...LURE_TYPES];
  let baits = [...BAIT_TYPES];
  let techniques = [...TECHNIQUES];

  if (speciesId) {
    lures = lures.filter(l => l.targetSpecies.includes(speciesId));
    baits = baits.filter(b => b.targetSpecies.includes(speciesId));
    techniques = techniques.filter(t => t.targetSpecies.includes(speciesId));
  }

  if (method) {
    // Lures don't have methods, only techniques - skip filtering
    techniques = techniques.filter(t => t.methods.includes(method));
  }

  return {
    lures: lures.sort((a, b) => b.popularity - a.popularity).slice(0, 10),
    baits: baits.sort((a, b) => b.popularity - a.popularity).slice(0, 10),
    techniques: techniques.slice(0, 5),
  };
};

// Helper functions to find gear by name
export const getLureByName = (name: string): LureType | undefined => {
  const lowerName = name.toLowerCase();
  return LURE_TYPES.find(l =>
    l.name.toLowerCase() === lowerName ||
    l.nameDa.toLowerCase() === lowerName ||
    l.name.toLowerCase().includes(lowerName) ||
    l.nameDa.toLowerCase().includes(lowerName)
  );
};

export const getBaitByName = (name: string): BaitType | undefined => {
  const lowerName = name.toLowerCase();
  return BAIT_TYPES.find(b =>
    b.name.toLowerCase() === lowerName ||
    b.nameDa.toLowerCase() === lowerName ||
    b.name.toLowerCase().includes(lowerName) ||
    b.nameDa.toLowerCase().includes(lowerName)
  );
};

export const getTechniqueByName = (name: string): TechniqueType | undefined => {
  const lowerName = name.toLowerCase();
  return TECHNIQUES.find(t =>
    t.name.toLowerCase() === lowerName ||
    t.nameDa.toLowerCase() === lowerName ||
    t.name.toLowerCase().includes(lowerName) ||
    t.nameDa.toLowerCase().includes(lowerName)
  );
};

export const getLureById = (id: string): LureType | undefined => {
  return LURE_TYPES.find(l => l.id === id);
};

export const getBaitById = (id: string): BaitType | undefined => {
  return BAIT_TYPES.find(b => b.id === id);
};

export const getTechniqueById = (id: string): TechniqueType | undefined => {
  return TECHNIQUES.find(t => t.id === id);
};

// Export counts for reference
export const GEAR_COUNTS = {
  lures: LURE_TYPES.length,
  baits: BAIT_TYPES.length,
  techniques: TECHNIQUES.length,
  speciesRecommendations: SPECIES_GEAR_RECOMMENDATIONS.length,
};
