/**
 * Comprehensive Danish Fishing Gear Database
 * Data sourced from:
 * - fishingindenmark.info/fiskeguide
 * - effektlageret.dk/shop/fang-en-fisk
 * - Common fishing knowledge
 */
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
    targetSpecies?: string[];
    specifications?: {
        weight?: string;
        length?: string;
        size?: string;
        color?: string[];
    };
    popularity?: number;
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
export declare const LURE_TYPES: LureType[];
export declare const BAIT_TYPES: BaitType[];
export declare const TECHNIQUES: TechniqueType[];
export declare const SPECIES_GEAR_RECOMMENDATIONS: SpeciesGearRecommendation[];
/**
 * Get all lures suitable for a species
 */
export declare const getLuresForSpecies: (speciesId: string) => LureType[];
/**
 * Get all baits suitable for a species
 */
export declare const getBaitsForSpecies: (speciesId: string) => BaitType[];
/**
 * Get techniques suitable for a species
 */
export declare const getTechniquesForSpecies: (speciesId: string) => TechniqueType[];
/**
 * Get gear recommendations for a species
 */
export declare const getGearRecommendation: (speciesId: string) => SpeciesGearRecommendation | undefined;
/**
 * Get all lures by category
 */
export declare const getLuresByCategory: (category: LureType["category"]) => LureType[];
/**
 * Get all baits by category
 */
export declare const getBaitsByCategory: (category: BaitType["category"]) => BaitType[];
/**
 * Search for lures/baits by name
 */
export declare const searchGear: (query: string) => {
    lures: LureType[];
    baits: BaitType[];
};
/**
 * Get all lure names for dropdown (Danish)
 */
export declare const getAllLureNamesDa: () => string[];
/**
 * Get all bait names for dropdown (Danish)
 */
export declare const getAllBaitNamesDa: () => string[];
/**
 * Get all technique names for dropdown (Danish)
 */
export declare const getAllTechniqueNamesDa: () => string[];
/**
 * Get combined lure + bait list for catch form dropdown
 */
export declare const getAllGearForDropdown: () => Array<{
    id: string;
    name: string;
    type: "lure" | "bait";
}>;
/**
 * Get smart gear suggestions based on species and method
 */
export declare const getSmartGearSuggestions: (speciesId?: string, method?: FishingMethod) => {
    lures: LureType[];
    baits: BaitType[];
    techniques: TechniqueType[];
};
export declare const getLureByName: (name: string) => LureType | undefined;
export declare const getBaitByName: (name: string) => BaitType | undefined;
export declare const getTechniqueByName: (name: string) => TechniqueType | undefined;
export declare const getLureById: (id: string) => LureType | undefined;
export declare const getBaitById: (id: string) => BaitType | undefined;
export declare const getTechniqueById: (id: string) => TechniqueType | undefined;
export declare const GEAR_COUNTS: {
    lures: number;
    baits: number;
    techniques: number;
    speciesRecommendations: number;
};
//# sourceMappingURL=fishingGear.d.ts.map