export interface FishSpecies {
    id: string;
    name: string;
    icon: string;
    category: 'ferskvand' | 'saltvand' | 'begge';
    season: string;
    minSize: number;
}
export declare const FISH_SPECIES_DB: FishSpecies[];
export interface FishingLocation {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    waterType: 'ferskvand' | 'saltvand' | 'brakvand';
    species: string[];
    depth?: string;
    regulations?: string;
}
export interface LocationCategory {
    region: string;
    locations: FishingLocation[];
}
export declare const LOCATIONS_BY_REGION: LocationCategory[];
export declare const ALL_FISHING_LOCATIONS: FishingLocation[];
export declare const getSpeciesById: (id: string) => FishSpecies | undefined;
export declare const getSpeciesName: (id: string) => string;
export declare const calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export declare const findNearestFishingLocation: (latitude: number, longitude: number, maxDistanceKm?: number) => {
    location: FishingLocation;
    distance: number;
} | null;
export declare const getWaterTypeColor: (waterType: FishingLocation["waterType"]) => string;
export declare const getWaterTypeIcon: (waterType: FishingLocation["waterType"]) => string;
export declare const getLocationsForSpecies: (speciesId: string) => FishingLocation[];
export declare const getSpeciesAtLocation: (locationName: string) => FishSpecies[];
export declare const findLocationsInRadius: (latitude: number, longitude: number, radiusKm: number) => Array<{
    location: FishingLocation;
    distance: number;
}>;
export declare const getLocationByName: (name: string) => FishingLocation | undefined;
export declare const getRegionForLocation: (locationName: string) => string | undefined;
export declare const getWaterTypeLabel: (waterType: FishingLocation["waterType"]) => string;
export declare const searchLocations: (query: string) => FishingLocation[];
//# sourceMappingURL=fishingLocations.d.ts.map