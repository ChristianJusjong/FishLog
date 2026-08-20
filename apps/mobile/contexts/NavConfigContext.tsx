import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface NavItemDef {
  route: string;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const ALL_NAV_ITEMS: NavItemDef[] = [
  {
    route: '/feed',
    label: 'Feed',
    iconActive: 'home',
    iconInactive: 'home-outline',
    description: 'Fiskefeed og seneste opdateringer',
  },
  {
    route: '/map',
    label: 'Kort',
    iconActive: 'map',
    iconInactive: 'map-outline',
    description: 'Interaktivt fiskekort med AI-spots',
  },
  {
    route: '/catches',
    label: 'Fangster',
    iconActive: 'fish',
    iconInactive: 'fish-outline',
    description: 'Din personlige fangstjournal & årbog',
  },
  {
    route: '/statistics',
    label: 'Statistik',
    iconActive: 'stats-chart',
    iconInactive: 'stats-chart-outline',
    description: 'AI hug-analyser og grejpræstation',
  },
  {
    route: '/ai-guide',
    label: 'AI Guide',
    iconActive: 'bulb',
    iconInactive: 'bulb-outline',
    description: 'Proaktiv AI bideradar & vejrrådgivning',
  },
  {
    route: '/hot-spots',
    label: 'Hot Spots',
    iconActive: 'flame',
    iconInactive: 'flame-outline',
    description: 'De mest produktive fiskepladser',
  },
  {
    route: '/friends',
    label: 'Venner',
    iconActive: 'people',
    iconInactive: 'people-outline',
    description: 'Live fiskekammerater og feed',
  },
  {
    route: '/challenges',
    label: 'Udfordringer',
    iconActive: 'fitness',
    iconInactive: 'fitness-outline',
    description: 'Månedlige fiskekonkurrencer',
  },
  {
    route: '/leaderboard',
    label: 'Rangliste',
    iconActive: 'podium',
    iconInactive: 'podium-outline',
    description: 'Topfiskere og artsrekorder',
  },
  {
    route: '/notifications',
    label: 'Notifikationer',
    iconActive: 'notifications',
    iconInactive: 'notifications-outline',
    description: 'Aktiviteter, likes og kommentarer',
  },
  {
    route: '/knots',
    label: 'Knob & Rigs',
    iconActive: 'git-branch',
    iconInactive: 'git-branch-outline',
    description: '100% offline fiskeknob med trin-for-trin guide',
  },
  {
    route: '/tackle-box',
    label: 'Grejboks',
    iconActive: 'briefcase',
    iconInactive: 'briefcase-outline',
    description: 'Dine fiskestænger, hjul og yndlingsagn',
  },
  {
    route: '/drafts',
    label: 'Kladder',
    iconActive: 'document-text',
    iconInactive: 'document-text-outline',
    description: 'Ugemte fangster og notater',
  },
  {
    route: '/fisketure',
    label: 'Fisketure',
    iconActive: 'navigate',
    iconInactive: 'navigate-outline',
    description: 'Logførte ture og rutehistorik',
  },
];

export const DEFAULT_NAV_ROUTES = ['/feed', '/map', '/catches', '/statistics'];

const NAV_STORAGE_KEY = '@custom_bottom_nav_items_v1';

interface NavConfigContextType {
  selectedRoutes: string[];
  setSelectedRoutes: (routes: string[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  getNavItem: (route: string) => NavItemDef;
}

const NavConfigContext = createContext<NavConfigContextType | undefined>(undefined);

export function NavConfigProvider({ children }: { children: ReactNode }) {
  const [selectedRoutes, setSelectedRoutesState] = useState<string[]>(DEFAULT_NAV_ROUTES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSavedNav();
  }, []);

  const loadSavedNav = async () => {
    try {
      const saved = await AsyncStorage.getItem(NAV_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          setSelectedRoutesState(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load bottom nav config:', error);
    }
  };

  const setSelectedRoutes = async (routes: string[]) => {
    try {
      if (routes.length === 4) {
        setSelectedRoutesState(routes);
        await AsyncStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(routes));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to save bottom nav config:', error);
    }
  };

  const resetToDefault = async () => {
    try {
      setSelectedRoutesState(DEFAULT_NAV_ROUTES);
      await AsyncStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(DEFAULT_NAV_ROUTES));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error) {
      console.error('Failed to reset bottom nav config:', error);
    }
  };

  const getNavItem = (route: string): NavItemDef => {
    return (
      ALL_NAV_ITEMS.find((item) => item.route === route) || {
        route,
        label: 'Menu',
        iconActive: 'ellipse',
        iconInactive: 'ellipse-outline',
        description: '',
      }
    );
  };

  return (
    <NavConfigContext.Provider
      value={{
        selectedRoutes,
        setSelectedRoutes,
        resetToDefault,
        isModalOpen,
        setIsModalOpen,
        getNavItem,
      }}
    >
      {children}
    </NavConfigContext.Provider>
  );
}

export function useNavConfig() {
  const context = useContext(NavConfigContext);
  if (!context) {
    throw new Error('useNavConfig must be used within a NavConfigProvider');
  }
  return context;
}
