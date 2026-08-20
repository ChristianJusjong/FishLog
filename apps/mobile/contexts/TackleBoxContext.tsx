import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export interface RodItem {
  id: string;
  name: string;
  brand: string;
  lengthFeet?: string; // F.eks. "9'2" (279cm)"
  castingWeight?: string; // F.eks. "7-28g"
  catchesCount: number;
  totalWeightKg: number;
}

export interface ReelItem {
  id: string;
  name: string;
  brand: string;
  size: string; // F.eks. "2500" el. "3000"
  lineType: string; // F.eks. "0.12mm Fletline"
  catchesCount: number;
}

export interface CustomLureItem {
  id: string;
  name: string;
  type: 'Blink' | 'Wobler' | 'Flue' | 'Jig/Gummi' | 'Spinner' | 'Andet';
  color: string;
  weightGrams?: string;
  catchesCount: number;
  favoriteSpecies?: string;
}

export interface TackleSetup {
  id: string;
  name: string; // F.eks. "Kyst Havørred Favorit"
  rodId?: string;
  reelId?: string;
  lureId?: string;
}

const STORAGE_KEYS = {
  RODS: '@tackle_box_rods_v1',
  REELS: '@tackle_box_reels_v1',
  LURES: '@tackle_box_lures_v1',
  SETUPS: '@tackle_box_setups_v1',
};

const DEFAULT_RODS: RodItem[] = [
  {
    id: 'rod-1',
    name: 'W3 Spin 2nd',
    brand: 'Westin',
    lengthFeet: "9'2 (275cm)",
    castingWeight: '7-30g',
    catchesCount: 8,
    totalWeightKg: 14.2,
  },
  {
    id: 'rod-2',
    name: 'Prorex XR Baitcast',
    brand: 'Daiwa',
    lengthFeet: "8'0 (244cm)",
    castingWeight: '40-120g',
    catchesCount: 4,
    totalWeightKg: 19.5,
  },
];

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    name: 'Stradic FM 2500',
    brand: 'Shimano',
    size: '2500',
    lineType: '0.12mm Sufix 13 Braid',
    catchesCount: 8,
  },
  {
    id: 'reel-2',
    name: 'Tatula HD 200',
    brand: 'Daiwa',
    size: '200',
    lineType: '0.28mm Spiderwire Stealth',
    catchesCount: 4,
  },
];

const DEFAULT_LURES: CustomLureItem[] = [
  {
    id: 'lure-1',
    name: 'Sandeel 19g',
    type: 'Blink',
    color: 'Pink / UV Hvid',
    weightGrams: '19g',
    catchesCount: 5,
    favoriteSpecies: 'Havørred',
  },
  {
    id: 'lure-2',
    name: 'Swim 12cm Jerkbait',
    type: 'Wobler',
    color: 'Official Roach',
    weightGrams: '53g',
    catchesCount: 4,
    favoriteSpecies: 'Gedde',
  },
];

interface TackleBoxContextType {
  rods: RodItem[];
  reels: ReelItem[];
  lures: CustomLureItem[];
  setups: TackleSetup[];
  addRod: (rod: Omit<RodItem, 'id' | 'catchesCount' | 'totalWeightKg'>) => Promise<void>;
  deleteRod: (id: string) => Promise<void>;
  addReel: (reel: Omit<ReelItem, 'id' | 'catchesCount'>) => Promise<void>;
  deleteReel: (id: string) => Promise<void>;
  addLure: (lure: Omit<CustomLureItem, 'id' | 'catchesCount'>) => Promise<void>;
  deleteLure: (id: string) => Promise<void>;
  recordCatchOnGear: (rodId?: string, reelId?: string, lureName?: string, weightKg?: number) => Promise<void>;
}

const TackleBoxContext = createContext<TackleBoxContextType | undefined>(undefined);

export function TackleBoxProvider({ children }: { children: ReactNode }) {
  const [rods, setRods] = useState<RodItem[]>(DEFAULT_RODS);
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [lures, setLures] = useState<CustomLureItem[]>(DEFAULT_LURES);
  const [setups, setSetups] = useState<TackleSetup[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedRods, savedReels, savedLures, savedSetups] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RODS),
        AsyncStorage.getItem(STORAGE_KEYS.REELS),
        AsyncStorage.getItem(STORAGE_KEYS.LURES),
        AsyncStorage.getItem(STORAGE_KEYS.SETUPS),
      ]);

      if (savedRods) setRods(JSON.parse(savedRods));
      if (savedReels) setReels(JSON.parse(savedReels));
      if (savedLures) setLures(JSON.parse(savedLures));
      if (savedSetups) setSetups(JSON.parse(savedSetups));
    } catch (e) {
      console.error('Failed to load tackle box data:', e);
    }
  };

  const addRod = async (rod: Omit<RodItem, 'id' | 'catchesCount' | 'totalWeightKg'>) => {
    const newRod: RodItem = {
      ...rod,
      id: `rod-${Date.now()}`,
      catchesCount: 0,
      totalWeightKg: 0,
    };
    const updated = [newRod, ...rods];
    setRods(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RODS, JSON.stringify(updated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const deleteRod = async (id: string) => {
    const updated = rods.filter((r) => r.id !== id);
    setRods(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RODS, JSON.stringify(updated));
  };

  const addReel = async (reel: Omit<ReelItem, 'id' | 'catchesCount'>) => {
    const newReel: ReelItem = {
      ...reel,
      id: `reel-${Date.now()}`,
      catchesCount: 0,
    };
    const updated = [newReel, ...reels];
    setReels(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(updated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const deleteReel = async (id: string) => {
    const updated = reels.filter((r) => r.id !== id);
    setReels(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(updated));
  };

  const addLure = async (lure: Omit<CustomLureItem, 'id' | 'catchesCount'>) => {
    const newLure: CustomLureItem = {
      ...lure,
      id: `lure-${Date.now()}`,
      catchesCount: 0,
    };
    const updated = [newLure, ...lures];
    setLures(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.LURES, JSON.stringify(updated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const deleteLure = async (id: string) => {
    const updated = lures.filter((l) => l.id !== id);
    setLures(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.LURES, JSON.stringify(updated));
  };

  const recordCatchOnGear = async (rodId?: string, reelId?: string, lureName?: string, weightKg: number = 0) => {
    if (rodId) {
      const updatedRods = rods.map((r) =>
        r.id === rodId
          ? { ...r, catchesCount: r.catchesCount + 1, totalWeightKg: +(r.totalWeightKg + weightKg).toFixed(1) }
          : r
      );
      setRods(updatedRods);
      await AsyncStorage.setItem(STORAGE_KEYS.RODS, JSON.stringify(updatedRods));
    }

    if (reelId) {
      const updatedReels = reels.map((rl) =>
        rl.id === reelId ? { ...rl, catchesCount: rl.catchesCount + 1 } : rl
      );
      setReels(updatedReels);
      await AsyncStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(updatedReels));
    }

    if (lureName) {
      const updatedLures = lures.map((l) =>
        l.name.toLowerCase().includes(lureName.toLowerCase())
          ? { ...l, catchesCount: l.catchesCount + 1 }
          : l
      );
      setLures(updatedLures);
      await AsyncStorage.setItem(STORAGE_KEYS.LURES, JSON.stringify(updatedLures));
    }
  };

  return (
    <TackleBoxContext.Provider
      value={{
        rods,
        reels,
        lures,
        setups,
        addRod,
        deleteRod,
        addReel,
        deleteReel,
        addLure,
        deleteLure,
        recordCatchOnGear,
      }}
    >
      {children}
    </TackleBoxContext.Provider>
  );
}

export function useTackleBox() {
  const context = useContext(TackleBoxContext);
  if (!context) {
    throw new Error('useTackleBox must be used within a TackleBoxProvider');
  }
  return context;
}
