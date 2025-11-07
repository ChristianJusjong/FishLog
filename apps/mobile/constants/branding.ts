/**
 * Hook Branding & Theme Constants
 *
 * App Name: Hook
 * Primary Logo: Stylized fish hook (modern, clean design)
 */

export const BRANDING = {
  appName: 'Hook',
  tagline: 'Din digitale fiskebog',
  description: 'Log dine fangster, del oplevelser, og bliv en bedre fisker',
} as const;

/**
 * Color Palette - Nature Inspired Modern Design
 * Featuring earthy, natural tones with excellent readability
 */
export const COLORS = {
  // Primary Colors - Deep Forest Green
  primary: '#2C5F4F',        // Deep Forest Green - Main brand color
  primaryLight: '#3D7A66',   // Lighter forest green
  primaryDark: '#1B4438',    // Darker forest green

  // Accent Colors - Warm Sunset Orange
  accent: '#E8773D',         // Warm Sunset Orange - CTA, important actions
  accentLight: '#F49563',    // Lighter warm orange
  accentDark: '#D15E28',     // Darker warm orange

  // Background Colors - Natural Light Tones
  background: '#FDFDFB',     // Warm white background
  backgroundLight: '#F5F7F4', // Soft sage background
  backgroundDark: '#2C5F4F', // Deep forest for dark sections

  // Surface Colors - Clean and Fresh
  surface: '#FFFFFF',        // Pure white card surfaces
  surfaceVariant: '#F5F7F4', // Soft sage variant

  // Text Colors - High Contrast for Readability
  text: '#1A1A1A',           // Near-black primary text
  textSecondary: '#4A5568',  // Slate gray secondary text
  textTertiary: '#718096',   // Light slate tertiary text
  textInverse: '#FFFFFF',    // White text on dark backgrounds

  // Icon Colors
  iconDefault: '#718096',    // Light slate for inactive icons
  iconActive: '#E8773D',     // Warm orange for active icons

  // Neutral Colors - Enhanced Contrast
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F7FAFC',        // Lightest gray
  gray200: '#EDF2F7',
  gray300: '#E2E8F0',
  gray400: '#CBD5E0',
  gray500: '#A0AEC0',
  gray600: '#718096',
  gray700: '#4A5568',
  gray800: '#2D3748',
  gray900: '#1A202C',

  // Secondary Colors - Natural Water Blue
  secondary: '#5B9AAA',      // Natural water blue
  secondaryLight: '#7DB4C2',
  secondaryDark: '#427785',

  // Nature Colors
  forest: '#2C5F4F',         // Deep forest green (matches primary)
  sand: '#E8DCC8',           // Warm sand/beige
  water: '#5B9AAA',          // Water blue (matches secondary)
  moss: '#7D9B76',           // Soft moss green
  sky: '#A8D5E2',            // Light sky blue
  earth: '#8B7355',          // Earthy brown

  // Semantic Colors - Nature Inspired
  success: '#4CAF50',        // Natural green for success
  warning: '#FFA726',        // Warm amber for warnings
  error: '#EF5350',          // Coral red for errors
  info: '#5B9AAA',           // Water blue for info

  // Border Colors - Subtle but Visible
  border: '#E2E8F0',
  borderDark: '#CBD5E0',
} as const;

/**
 * Typography
 *
 * Font Familie: Open Sans (eller Roboto som fallback)
 * Moderne sans-serif for læsbarhed på digitale skærme
 */
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: 'System',    // Open Sans Regular / Roboto Regular
    medium: 'System',     // Open Sans Medium / Roboto Medium
    semibold: 'System',   // Open Sans Semibold / Roboto Medium
    bold: 'System',       // Open Sans Bold / Roboto Bold
  },

  // Font Sizes (defineret ud fra design system)
  fontSize: {
    xs: 12,       // Tab Bar Labels
    sm: 14,       // Small Text (Metadata, datoer)
    base: 16,     // Body Text (Generel tekst)
    lg: 18,       // H2 (Sektions-overskrifter), Button Text (CTA)
    xl: 20,       // Large text
    '2xl': 24,    // H1 (Titel/Sidehoved)
    '3xl': 30,    // Extra large titles
    '4xl': 36,    // Hero text
    '5xl': 48,    // Display text
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,   // Body Text, Tab Bar Labels, Small Text
    medium: '500' as const,    // Medium weight (optional)
    semibold: '600' as const,  // H1, H2, Button Text
    bold: '700' as const,      // Bold emphasis
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,     // Headings
    normal: 1.5,     // Body text
    relaxed: 1.75,   // Spacious text
  },

  // Pre-defined Text Styles (with improved readability)
  styles: {
    // H1 - Titel/Sidehoved
    h1: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.3,
      color: '#1A1A1A',  // High contrast near-black
    },
    h1Dark: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.3,
      color: '#FFFFFF',
    },

    // H2 - Sektions-overskrifter
    h2: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      color: '#1A1A1A',  // High contrast near-black
    },
    h2Dark: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      color: '#FFFFFF',
    },

    // Body Text - Generel tekst
    body: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      color: '#1A1A1A',  // High contrast near-black
    },

    // Small Text - Metadata, datoer
    small: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      color: '#4A5568',  // Slate gray with good contrast
    },

    // Button Text - CTA
    button: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      color: '#FFFFFF',
    },

    // Tab Bar Labels
    tabLabel: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.3,
      color: '#718096',  // Inactive with better contrast
    },
    tabLabelActive: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      color: '#E8773D',  // Active warm orange
    },
  },
} as const;

/**
 * Spacing (based on 4px grid)
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

/**
 * Border Radius
 */
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Shadows
 */
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Logo Variants
 */
export const LOGO_VARIANTS = {
  light: 'light',   // White logo for dark backgrounds
  dark: 'dark',     // Dark petrol logo for light backgrounds
  color: 'color',   // Orange logo (accent color)
} as const;

/**
 * Breakpoints (for responsive design)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Icon Sizes
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

/**
 * Component Variants
 */
export const BUTTON_VARIANTS = {
  primary: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  accent: {
    backgroundColor: COLORS.accent,
    color: COLORS.white,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
    color: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: COLORS.primary,
  },
} as const;
