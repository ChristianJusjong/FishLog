import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Platform } from 'react-native';
import {
  COLORS,
  DARK_COLORS,
  NIGHT_VISION_COLORS,
  GRADIENTS,
  SHADOWS,
  GLASS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  ANIMATION
} from '@/constants/branding';

export type Theme = 'light' | 'dark' | 'nightVision';

// Extended theme colors type with all premium features
type ThemeColors = typeof COLORS & {
  // Computed convenience colors
  cardBackground: string;
  inputBackground: string;
  divider: string;
  shimmer: string;
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: Theme) => Promise<void>;
  colors: ThemeColors;
  isDark: boolean;
  isNightVision: boolean;
  // Premium design utilities
  gradients: typeof GRADIENTS;
  shadows: typeof SHADOWS;
  glass: typeof GLASS;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  typography: typeof TYPOGRAPHY;
  animation: typeof ANIMATION;
}

// Extend colors with computed convenience values
const extendColors = (baseColors: any, isDark: boolean): any => ({
  ...baseColors,
  cardBackground: baseColors.surface,
  inputBackground: isDark ? baseColors.surfaceVariant : baseColors.gray50,
  divider: baseColors.border,
  overlay: baseColors.overlay as string,
  shimmer: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
});

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setThemeMode: async () => {},
  colors: extendColors(COLORS, false) as ThemeColors,
  isDark: false,
  isNightVision: false,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  glass: GLASS,
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
  animation: ANIMATION,
});

export const useTheme = () => useContext(ThemeContext);

// Hook for dynamic styles based on theme
export const useDynamicStyles = <T extends object>(
  styleFactory: (colors: ThemeColors, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return useMemo(() => styleFactory(colors, isDark), [colors, isDark, styleFactory]);
};

const THEME_STORAGE_KEY = '@fishlog/theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Update StatusBar when theme changes
  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content', true);
    } else {
      StatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content');
      StatusBar.setBackgroundColor(
        theme === 'nightVision' ? '#000000' : theme === 'dark' ? '#030D18' : '#F8FAFC'
      );
    }
  }, [theme]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'nightVision') {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = useCallback(async (mode: Theme) => {
    try {
      setTheme(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  const isDark = theme === 'dark' || theme === 'nightVision';
  const isNightVision = theme === 'nightVision';
  const baseColors = isNightVision
    ? NIGHT_VISION_COLORS
    : isDark
    ? DARK_COLORS
    : COLORS;

  const colors = useMemo(() => extendColors(baseColors, isDark), [baseColors, isDark]);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setThemeMode,
    colors,
    isDark,
    isNightVision,
    gradients: GRADIENTS,
    shadows: SHADOWS,
    glass: GLASS,
    spacing: SPACING,
    radius: RADIUS,
    typography: TYPOGRAPHY,
    animation: ANIMATION,
  }), [theme, toggleTheme, setThemeMode, colors, isDark, isNightVision]);

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utility hooks for common patterns
export const useColors = () => useTheme().colors;
export const useIsDark = () => useTheme().isDark;
export const useShadows = () => useTheme().shadows;
export const useGradients = () => useTheme().gradients;
export const useSpacing = () => useTheme().spacing;
export const useRadius = () => useTheme().radius;
