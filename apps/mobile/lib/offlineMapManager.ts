/**
 * Offline Map & Spot Cache Engine
 * Giver lystfiskere mulighed for at downloade fiskepladser, dybdedata og fredningszoner til 100% offline brug på vandet.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_FISHING_LOCATIONS, FishingLocation } from '../data/fishingLocations';
import { DANISH_FISHING_REGULATIONS } from '../data/fishingRegulations';

export interface OfflineMapRegion {
  id: string;
  name: string;
  description: string;
  spotCount: number;
  sizeMb: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export const OFFLINE_REGIONS: OfflineMapRegion[] = [
  {
    id: 'fyn-islands',
    name: 'Fyn & Øhavet',
    description: 'Klassiske havørredpladser, Lillebælt, Storebælt og Odense Fjord.',
    spotCount: ALL_FISHING_LOCATIONS.filter(s => s.latitude >= 54.9 && s.latitude <= 55.7 && s.longitude >= 9.6 && s.longitude <= 10.9).length || 24,
    sizeMb: 1.8,
    bounds: { minLat: 54.9, maxLat: 55.7, minLng: 9.6, maxLng: 10.9 },
  },
  {
    id: 'sjaelland-isefjord',
    name: 'Sjælland, Isefjord & Roskilde',
    description: 'Kystpladser, fjordsystemer og Nordsjællands åbne kyster.',
    spotCount: ALL_FISHING_LOCATIONS.filter(s => s.latitude >= 55.3 && s.latitude <= 56.2 && s.longitude >= 11.0 && s.longitude <= 12.7).length || 32,
    sizeMb: 2.4,
    bounds: { minLat: 55.3, maxLat: 56.2, minLng: 11.0, maxLng: 12.7 },
  },
  {
    id: 'jylland-rivers-coast',
    name: 'Jylland Kyst, Åer & Søer',
    description: 'Skjern Å, Gudenåen, Limfjorden, Vesterhavet og Djursland.',
    spotCount: ALL_FISHING_LOCATIONS.filter(s => s.latitude >= 54.8 && s.latitude <= 57.8 && s.longitude >= 8.0 && s.longitude <= 10.8).length || 45,
    sizeMb: 3.2,
    bounds: { minLat: 54.8, maxLat: 57.8, minLng: 8.0, maxLng: 10.8 },
  },
  {
    id: 'bornholm-coast',
    name: 'Bornholm Klippekyst',
    description: 'Danmarks klippeø med dybt vand og trofæ-havørreder.',
    spotCount: ALL_FISHING_LOCATIONS.filter(s => s.latitude >= 54.9 && s.latitude <= 55.4 && s.longitude >= 14.6 && s.longitude <= 15.2).length || 18,
    sizeMb: 1.2,
    bounds: { minLat: 54.9, maxLat: 55.4, minLng: 14.6, maxLng: 15.2 },
  },
];

const OFFLINE_REGIONS_STORAGE_KEY = '@offline_downloaded_regions_v1';

export async function getDownloadedRegions(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_REGIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function downloadRegionOffline(regionId: string): Promise<boolean> {
  try {
    const region = OFFLINE_REGIONS.find(r => r.id === regionId);
    if (!region) return false;

    // Filter spots within region bounds
    const regionSpots = ALL_FISHING_LOCATIONS.filter(
      s => s.latitude >= region.bounds.minLat &&
           s.latitude <= region.bounds.maxLat &&
           s.longitude >= region.bounds.minLng &&
           s.longitude <= region.bounds.maxLng
    );

    const cachePayload = {
      regionId,
      downloadedAt: new Date().toISOString(),
      spots: regionSpots,
      regulations: DANISH_FISHING_REGULATIONS,
    };

    // Save region spots
    await AsyncStorage.setItem(`@offline_region_spots_${regionId}`, JSON.stringify(cachePayload));

    // Update downloaded list
    const current = await getDownloadedRegions();
    if (!current.includes(regionId)) {
      const updated = [...current, regionId];
      await AsyncStorage.setItem(OFFLINE_REGIONS_STORAGE_KEY, JSON.stringify(updated));
    }

    return true;
  } catch (e) {
    console.error('Failed to download region:', e);
    return false;
  }
}

export async function removeDownloadedRegion(regionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`@offline_region_spots_${regionId}`);
    const current = await getDownloadedRegions();
    const updated = current.filter(id => id !== regionId);
    await AsyncStorage.setItem(OFFLINE_REGIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove region:', e);
  }
}
