import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Platform } from 'react-native';
import {
  COLORS,
  DARK_COLORS,
  GRADIENTS,
  SHADOWS,
  GLASS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  ANIMATION
} from '@/constants/branding';

export type Theme = 'light' | 'dark';

// Extended theme colors type with all premium features
interface ThemeColors extends typeof COLORS {
  // Computed convenience colors
  cardBackground: string;
  inputBackground: string;
  divider: string;
  overlay: string;
  shimmer: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
  isDark: boolean;
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
const extendColors = (baseColors: typeof COLORS | typeof DARK_COLORS, isDark: boolean): ThemeColors => ({
  ...baseColors,
  cardBackground: isDark ? baseColors.surface : baseColors.surface,
  inputBackground: isDark ? baseColors.surfaceVariant : baseColors.gray50,
  divider: isDark ? baseColors.border : baseColors.border,
  overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(10, 37, 64, 0.5)',
  shimmer: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
});

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: extendColors(COLORS, false),
  isDark: false,
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
      StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content', true);
    } else {
      StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(theme === 'dark' ? '#030D18' : '#F8FAFC');
    }
  }, [theme]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = useCallback(async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  const isDark = theme === 'dark';
  const baseColors = isDark ? DARK_COLORS : COLORS;
  const colors = useMemo(() => extendColors(baseColors, isDark), [baseColors, isDark]);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    colors,
    isDark,
    gradients: GRADIENTS,
    shadows: SHADOWS,
    glass: GLASS,
    spacing: SPACING,
    radius: RADIUS,
    typography: TYPOGRAPHY,
    animation: ANIMATION,
  }), [theme, toggleTheme, colors, isDark]);

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
