/**
 * FishLog Branding & Theme Constants
 *
 * App Name: FishLog
 * Primary Logo: Stylized fish hook (modern, line-based design)
 */

export const BRANDING = {
  appName: 'FishLog',
  tagline: 'Din digitale fiskebog',
  description: 'Log dine fangster, del oplevelser, og bliv en bedre fisker',
} as const;

/**
 * Color Palette
 */
export const COLORS = {
  // Primary Colors
  primary: '#1E3F40',        // Dark Petrol - Baggrund, store elementer (dybt vand/skov)
  primaryLight: '#2D5555',   // Lighter variant of primary
  primaryDark: '#0F2525',    // Darker variant of primary

  // Accent Colors
  accent: '#FF7F3F',         // Vivid Orange - CTA, vigtige ikoner (solnedgang/liv)
  accentLight: '#FF9966',    // Lighter orange
  accentDark: '#E66A2C',     // Darker orange

  // Background Colors
  background: '#FFFFFF',     // Main white background
  backgroundLight: '#F0F2F5', // Light Grey - Kort baggrunde, sektioner
  backgroundDark: '#1E3F40', // Dark petrol for dark sections

  // Surface Colors
  surface: '#FFFFFF',        // Card surfaces
  surfaceVariant: '#F0F2F5', // Light grey variant for sections

  // Text Colors
  text: '#333333',           // Primary Text - Overskrifter, hovedtekst (mørkegrå)
  textSecondary: '#666666',  // Secondary Text - Undertekster, datoer, metadata
  textTertiary: '#999999',   // Tertiary Text - Ikke-interaktive ikoner
  textInverse: '#FFFFFF',    // White Text - På mørke baggrunde

  // Icon Colors
  iconDefault: '#999999',    // Ikke-interaktive ikoner (mellemgrå)
  iconActive: '#FF7F3F',     // Interaktive ikoner (valgt/aktiv) - accent color

  // Neutral Colors (for compatibility)
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F0F2F5',        // Light grey (matching backgroundLight)
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#999999',        // Icon default
  gray500: '#666666',        // Text secondary
  gray600: '#333333',        // Text primary
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Secondary Colors (for water/nature elements)
  secondary: '#4A90A4',      // Lyseblå/Turkis - Vand elementer
  secondaryLight: '#6BACC0',
  secondaryDark: '#347A8D',

  // Nature Colors
  forest: '#2F5233',         // Skov Grøn
  sand: '#D4C5A9',           // Sand/Beige
  water: '#4A90A4',          // Water blue

  // Semantic Colors
  success: '#22C55E',        // Green for success states
  warning: '#F59E0B',        // Amber for warnings
  error: '#EF4444',          // Red for errors
  info: '#3B82F6',           // Blue for info

  // Border Colors
  border: '#E5E5E5',
  borderDark: '#D4D4D4',
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

  // Pre-defined Text Styles (baseret på design system)
  styles: {
    // H1 - Titel/Sidehoved
    h1: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      color: '#333333',  // Or #FFFFFF on dark backgrounds
    },
    h1Dark: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      color: '#FFFFFF',
    },

    // H2 - Sektions-overskrifter
    h2: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      color: '#333333',
    },
    h2Dark: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      color: '#FFFFFF',
    },

    // Body Text - Generel tekst
    body: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      color: '#333333',
    },

    // Small Text - Metadata, datoer
    small: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      color: '#666666',
    },

    // Button Text - CTA
    button: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      color: '#FFFFFF',
    },

    // Tab Bar Labels
    tabLabel: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.25,
      color: '#999999',  // Inactive
    },
    tabLabelActive: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.25,
      color: '#FF7F3F',  // Active (Vivid Orange)
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
