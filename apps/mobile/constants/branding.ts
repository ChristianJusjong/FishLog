/**
 * Hook - Premium Fishing Tech Experience
 *
 * Design Philosophy: "Where Nature Meets Technology"
 * A sophisticated fusion of ocean depths, dawn horizons, and cutting-edge tech.
 *
 * Color Story:
 * - Deep Ocean (Primary): The mysterious depths where trophy fish await
 * - Golden Amber (Accent): The warm glow of sunrise on the water, the thrill of a catch
 * - Midnight Teal: The calm before the bite, technological precision
 * - Pearl White: Morning mist on the lake, clean interfaces
 */

export const BRANDING = {
  appName: 'Hook',
  tagline: 'Din digitale fiskebog',
  description: 'Log dine fangster, del oplevelser, og bliv en bedre fisker',
} as const;

/**
 * Premium Color Palette - Ocean Tech Theme
 * Sophisticated colors that combine nature's beauty with modern technology
 */
export const COLORS = {
  // ═══════════════════════════════════════════════════════════════
  // PRIMARY - Deep Ocean Blue (Technology meets the deep)
  // ═══════════════════════════════════════════════════════════════
  primary: '#0A2540',           // Deep ocean midnight - main brand
  primaryLight: '#1A3A5C',      // Ocean depths
  primaryDark: '#051628',       // Abyss blue
  primaryMuted: '#1E4976',      // Softer ocean blue

  // ═══════════════════════════════════════════════════════════════
  // ACCENT - Golden Amber (Trophy catch, sunrise on water)
  // ═══════════════════════════════════════════════════════════════
  accent: '#F5A623',            // Golden amber - premium CTA
  accentLight: '#FFD93D',       // Sunrise gold
  accentDark: '#D4880F',        // Deep gold
  accentGlow: 'rgba(245, 166, 35, 0.3)', // Glow effect

  // ═══════════════════════════════════════════════════════════════
  // SECONDARY - Teal (Calm waters, precision)
  // ═══════════════════════════════════════════════════════════════
  secondary: '#0EA5A5',         // Vibrant teal
  secondaryLight: '#14D9D9',    // Bright aqua
  secondaryDark: '#0A7878',     // Deep teal
  secondaryMuted: '#0D9090',    // Soft teal

  // ═══════════════════════════════════════════════════════════════
  // BACKGROUNDS - Clean, sophisticated surfaces
  // ═══════════════════════════════════════════════════════════════
  background: '#F8FAFC',        // Pearl white - clean, premium
  backgroundLight: '#FFFFFF',   // Pure white
  backgroundDark: '#0A2540',    // Deep ocean for dark sections
  backgroundElevated: '#FFFFFF', // Elevated surfaces

  // ═══════════════════════════════════════════════════════════════
  // SURFACES - Layered depth with glass effect support
  // ═══════════════════════════════════════════════════════════════
  surface: '#FFFFFF',           // Card surfaces
  surfaceVariant: '#F1F5F9',    // Subtle surface variation
  surfaceHover: '#E8EEF4',      // Hover state
  surfaceActive: '#DDE5ED',     // Active/pressed state
  surfaceGlass: 'rgba(255, 255, 255, 0.85)', // Glassmorphism

  // ═══════════════════════════════════════════════════════════════
  // TEXT - High contrast, readable hierarchy
  // ═══════════════════════════════════════════════════════════════
  text: '#0A2540',              // Primary text - deep ocean
  textPrimary: '#0A2540',       // Primary text
  textSecondary: '#4A6382',     // Secondary - ocean mist
  textTertiary: '#7A94B0',      // Tertiary - soft blue-gray
  textMuted: '#94A3B8',         // Muted text
  textInverse: '#FFFFFF',       // White text on dark
  textAccent: '#F5A623',        // Accent text - golden

  // ═══════════════════════════════════════════════════════════════
  // ICONS
  // ═══════════════════════════════════════════════════════════════
  iconDefault: '#7A94B0',       // Default icon color
  iconActive: '#F5A623',        // Active icon - golden
  iconPrimary: '#0A2540',       // Primary icon color
  iconSecondary: '#0EA5A5',     // Secondary icon - teal

  // ═══════════════════════════════════════════════════════════════
  // NEUTRALS - Blue-tinted grays for cohesion
  // ═══════════════════════════════════════════════════════════════
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',            // Lightest
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',           // Darkest

  // ═══════════════════════════════════════════════════════════════
  // NATURE PALETTE - Ocean & Shore inspired
  // ═══════════════════════════════════════════════════════════════
  ocean: '#0A2540',             // Deep ocean
  oceanLight: '#1E4976',        // Lighter ocean
  wave: '#0EA5A5',              // Wave teal
  foam: '#E0F7FA',              // Sea foam
  sand: '#F5DEB3',              // Warm sand
  dawn: '#FF8A65',              // Dawn sky
  dusk: '#7C4DFF',              // Dusk purple
  kelp: '#2E7D32',              // Kelp green
  coral: '#FF7043',             // Coral
  forest: '#1B4332',            // Deep forest green
  water: '#1E88E5',             // Clear water blue

  // ═══════════════════════════════════════════════════════════════
  // SEMANTIC - Status colors with ocean twist
  // ═══════════════════════════════════════════════════════════════
  success: '#10B981',           // Emerald - caught fish!
  successLight: '#D1FAE5',
  successDark: '#059669',
  warning: '#F59E0B',           // Amber - attention
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  error: '#EF4444',             // Red - danger
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  info: '#0EA5A5',              // Teal - info
  infoLight: '#CCFBF1',
  infoDark: '#0D9488',

  // ═══════════════════════════════════════════════════════════════
  // BORDERS - Subtle, sophisticated
  // ═══════════════════════════════════════════════════════════════
  border: '#E2E8F0',            // Default border
  borderLight: '#F1F5F9',       // Light border
  borderDark: '#CBD5E1',        // Darker border
  borderFocus: '#0EA5A5',       // Focus state - teal
  borderAccent: '#F5A623',      // Accent border - golden

  // ═══════════════════════════════════════════════════════════════
  // OVERLAY
  // ═══════════════════════════════════════════════════════════════
  overlay: 'rgba(10, 37, 64, 0.5)' as string,  // Modal/backdrop overlay

  // ═══════════════════════════════════════════════════════════════
  // GRADIENTS (as string values for StyleSheet)
  // ═══════════════════════════════════════════════════════════════
  gradientPrimary: ['#0A2540', '#1A3A5C'],        // Deep ocean
  gradientAccent: ['#F5A623', '#FFD93D'],         // Golden sunrise
  gradientOcean: ['#0A2540', '#0EA5A5'],          // Ocean to teal
  gradientDawn: ['#0A2540', '#FF8A65', '#FFD93D'], // Dawn on ocean
  gradientCard: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'], // Glass
} as const;

/**
 * Dark Mode - Immersive Night Fishing Theme
 * Deep, rich colors for low-light conditions
 */
export const DARK_COLORS = {
  // Primary - Brighter for dark mode visibility
  primary: '#1E4976',           // Brighter ocean blue
  primaryLight: '#2D6BA8',      // Even brighter
  primaryDark: '#0A2540',       // Original as dark
  primaryMuted: '#3D7AB8',

  // Accent - Maintains vibrancy
  accent: '#FFD93D',            // Brighter gold
  accentLight: '#FFE566',
  accentDark: '#F5A623',
  accentGlow: 'rgba(255, 217, 61, 0.3)',

  // Secondary
  secondary: '#14D9D9',         // Bright aqua
  secondaryLight: '#5EEAD4',
  secondaryDark: '#0EA5A5',
  secondaryMuted: '#2DD4BF',

  // Backgrounds - Rich, deep tones
  background: '#030D18',        // Near black with blue tint
  backgroundLight: '#071A2E',   // Slightly lighter
  backgroundDark: '#010509',    // Deepest black
  backgroundElevated: '#0A1F38',

  // Surfaces
  surface: '#0A1F38',           // Elevated dark surface
  surfaceVariant: '#0F2A48',    // Surface variation
  surfaceHover: '#143558',
  surfaceActive: '#1A4068',
  surfaceGlass: 'rgba(10, 31, 56, 0.85)',

  // Text - Light colors for dark backgrounds
  text: '#F1F5F9',              // Almost white
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',     // Soft gray-blue
  textTertiary: '#64748B',      // Dimmer
  textMuted: '#475569',
  textInverse: '#0A2540',
  textAccent: '#FFD93D',

  // Icons
  iconDefault: '#64748B',
  iconActive: '#FFD93D',
  iconPrimary: '#F1F5F9',
  iconSecondary: '#14D9D9',

  // Neutrals - Blue-tinted for dark mode
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#0F172A',
  gray100: '#1E293B',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748B',
  gray500: '#94A3B8',
  gray600: '#CBD5E1',
  gray700: '#E2E8F0',
  gray800: '#F1F5F9',
  gray900: '#F8FAFC',

  // Nature - Adjusted brightness
  ocean: '#1E4976',
  oceanLight: '#3D7AB8',
  wave: '#14D9D9',
  foam: '#134E4A',
  sand: '#C4A77D',
  dawn: '#FF9E80',
  dusk: '#9575CD',
  kelp: '#4CAF50',
  coral: '#FF8A65',
  forest: '#2D5A3D',            // Forest green (dark mode)
  water: '#42A5F5',             // Water blue (dark mode)

  // Semantic
  success: '#34D399',
  successLight: '#065F46',
  successDark: '#10B981',
  warning: '#FBBF24',
  warningLight: '#78350F',
  warningDark: '#F59E0B',
  error: '#F87171',
  errorLight: '#7F1D1D',
  errorDark: '#EF4444',
  info: '#22D3EE',
  infoLight: '#164E63',
  infoDark: '#06B6D4',

  // Borders
  border: '#1E293B',
  borderLight: '#0F172A',
  borderDark: '#334155',
  borderFocus: '#14D9D9',
  borderAccent: '#FFD93D',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)' as string,  // Dark mode overlay

  // Gradients
  gradientPrimary: ['#030D18', '#0A2540'],
  gradientAccent: ['#F5A623', '#FFD93D'],
  gradientOcean: ['#030D18', '#0EA5A5'],
  gradientDawn: ['#030D18', '#FF8A65', '#FFD93D'],
  gradientCard: ['rgba(10,31,56,0.9)', 'rgba(10,31,56,0.7)'],
} as const;

/**
 * Premium Typography System
 * Refined hierarchy with elegant spacing
 */
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Refined font sizes with better hierarchy
  fontSize: {
    xs: 11,           // Micro text, labels
    sm: 13,           // Small metadata
    base: 15,         // Body text
    md: 16,           // Slightly larger body
    lg: 18,           // Section headers
    xl: 20,           // Sub-titles
    '2xl': 24,        // Page titles
    '3xl': 28,        // Large titles
    '4xl': 34,        // Hero headers
    '5xl': 42,        // Display
    '6xl': 52,        // Massive display
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },

  // Letter spacing for premium feel
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
    caps: 1.5,        // For uppercase text
  },

  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Pre-defined premium text styles
  styles: {
    // Display - Hero text
    display: {
      fontSize: 42,
      fontWeight: '700' as const,
      lineHeight: 48,
      letterSpacing: -0.5,
      color: '#0A2540',
    },

    // H1 - Page titles
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
      letterSpacing: -0.25,
      color: '#0A2540',
    },
    h1Dark: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
      letterSpacing: -0.25,
      color: '#F1F5F9',
    },

    // H2 - Section headers
    h2: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: -0.15,
      color: '#0A2540',
    },
    h2Dark: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: -0.15,
      color: '#F1F5F9',
    },

    // H3 - Sub-sections
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: '#0A2540',
    },
    h3Dark: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: '#F1F5F9',
    },

    // H4 - Small headers
    h4: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
      color: '#0A2540',
    },

    // Body text
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
      color: '#0A2540',
    },
    bodyLarge: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 26,
      color: '#0A2540',
    },

    // Small/Caption
    small: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
      color: '#4A6382',
    },
    caption: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.25,
      color: '#7A94B0',
    },

    // Tiny - Very small text (badges)
    tiny: {
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 12,
      color: '#7A94B0',
    },

    // Label - Form labels, uppercase
    label: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 14,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
      color: '#7A94B0',
    },

    // Button text
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
      letterSpacing: 0.25,
      color: '#FFFFFF',
    },
    buttonLarge: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
      letterSpacing: 0.25,
      color: '#FFFFFF',
    },

    // Navigation
    tabLabel: {
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 12,
      letterSpacing: 0.25,
      color: '#7A94B0',
    },
    tabLabelActive: {
      fontSize: 10,
      fontWeight: '700' as const,
      lineHeight: 12,
      letterSpacing: 0.25,
      color: '#F5A623',
    },

    // Stat numbers
    statValue: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 32,
      letterSpacing: -0.5,
      color: '#0A2540',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.5,
      color: '#7A94B0',
    },
  },
} as const;

/**
 * Premium Spacing System
 * Based on 4px grid with additional fine-tuning values
 */
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

/**
 * Premium Border Radius
 * Smooth, modern curves
 */
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

/**
 * Premium Shadow System
 * Layered, sophisticated shadows with subtle color
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
  // Premium glow shadows
  glow: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glowTeal: {
    shadowColor: '#0EA5A5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  // Card shadows
  card: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  // Inner shadow (use with care)
  inner: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 0,
  },
} as const;

/**
 * Glassmorphism Styles
 * Modern glass effect for premium UI
 */
export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(10, 37, 64, 0.7)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  accent: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderWidth: 1,
  },
} as const;

/**
 * Premium Gradient Configurations
 * For LinearGradient components
 */
export const GRADIENTS = {
  // Ocean gradients
  ocean: {
    colors: ['#0A2540', '#1A3A5C'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  oceanDeep: {
    colors: ['#051628', '#0A2540', '#1E4976'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Dawn/Sunrise
  dawn: {
    colors: ['#0A2540', '#1E4976', '#FF8A65', '#FFD93D'] as const,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  sunrise: {
    colors: ['#FFD93D', '#FF8A65', '#FF7043'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Golden
  gold: {
    colors: ['#F5A623', '#FFD93D'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  goldShimmer: {
    colors: ['#D4880F', '#F5A623', '#FFD93D', '#F5A623'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Teal
  teal: {
    colors: ['#0A7878', '#0EA5A5', '#14D9D9'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Cards & Surfaces
  cardLight: {
    colors: ['rgba(255,255,255,1)', 'rgba(248,250,252,1)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  cardDark: {
    colors: ['rgba(15,42,72,1)', 'rgba(10,31,56,1)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Premium highlight
  shimmer: {
    colors: ['transparent', 'rgba(255,255,255,0.3)', 'transparent'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

/**
 * Logo Variants
 */
export const LOGO_VARIANTS = {
  light: 'light',
  dark: 'dark',
  color: 'color',
  gold: 'gold',
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
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/**
 * Animation Configuration
 * Smooth, premium feel
 */
export const ANIMATION = {
  // Durations (ms)
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,

  // Spring configs for react-native-reanimated
  spring: {
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 200 },
    stiff: { damping: 25, stiffness: 300 },
    soft: { damping: 15, stiffness: 80 },
  },

  // Easing curves
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

/**
 * Icon Sizes
 */
export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

/**
 * Premium Button Variants
 */
export const BUTTON_VARIANTS = {
  primary: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderRadius: RADIUS.lg,
  },
  accent: {
    backgroundColor: COLORS.accent,
    color: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    borderRadius: RADIUS.lg,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    color: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  outlineAccent: {
    backgroundColor: 'transparent',
    borderColor: COLORS.accent,
    borderWidth: 1.5,
    color: COLORS.accent,
    borderRadius: RADIUS.lg,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: COLORS.white,
    borderRadius: RADIUS.lg,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
} as const;

/**
 * Premium FAB (Floating Action Button)
 */
export const FAB = {
  size: 60,
  iconSize: 26,
  backgroundColor: COLORS.accent,
  color: COLORS.primary,
  borderRadius: RADIUS['4xl'],
  ...SHADOWS.glow,
} as const;

/**
 * Premium Card Styles
 */
export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  elevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  outlined: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glass: {
    backgroundColor: COLORS.surfaceGlass,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...SHADOWS.sm,
  },
  premium: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.cardHover,
  },
} as const;

/**
 * Premium Input Styles
 */
export const INPUT_STYLES = {
  default: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
  },
  focused: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
} as const;

/**
 * Avatar Sizes
 */
export const AVATAR_SIZES = {
  xs: { size: 24, borderRadius: 12 },
  sm: { size: 32, borderRadius: 16 },
  md: { size: 40, borderRadius: 20 },
  base: { size: 48, borderRadius: 24 },
  lg: { size: 64, borderRadius: 32 },
  xl: { size: 80, borderRadius: 40 },
  '2xl': { size: 120, borderRadius: 60 },
} as const;

/**
 * Badge Styles
 */
export const BADGE_STYLES = {
  default: {
    backgroundColor: COLORS.gray200,
    color: COLORS.textSecondary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.white,
  },
  accent: {
    backgroundColor: COLORS.accent,
    color: COLORS.primary,
  },
  success: {
    backgroundColor: COLORS.successLight,
    color: COLORS.successDark,
  },
  warning: {
    backgroundColor: COLORS.warningLight,
    color: COLORS.warningDark,
  },
  error: {
    backgroundColor: COLORS.errorLight,
    color: COLORS.errorDark,
  },
} as const;

/**
 * Status Indicator Colors
 */
export const STATUS_COLORS = {
  online: COLORS.success,
  offline: COLORS.gray400,
  busy: COLORS.error,
  away: COLORS.warning,
  active: COLORS.accent,
} as const;
