/**
 * Hook App - Premium Design System
 * Consolidated theme with consistent spacing, colors, typography, and components
 */

import { TextStyle, ViewStyle, Platform } from 'react-native';
import {
  COLORS,
  DARK_COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  GRADIENTS,
  GLASS,
  ANIMATION,
  ICON_SIZES,
  CARD_STYLES,
  INPUT_STYLES,
  BADGE_STYLES,
  AVATAR_SIZES,
  FAB,
} from './branding';

// Re-export all branding constants
export {
  COLORS,
  DARK_COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  GRADIENTS,
  GLASS,
  ANIMATION,
  ICON_SIZES,
  CARD_STYLES as PREMIUM_CARD_STYLES,
  INPUT_STYLES as PREMIUM_INPUT_STYLES,
  BADGE_STYLES as PREMIUM_BADGE_STYLES,
  AVATAR_SIZES as PREMIUM_AVATAR_SIZES,
  FAB as FAB_CONFIG,
};

/**
 * Premium Card Style - Used across all screens
 */
export const CARD_STYLE: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.xl,
  padding: SPACING.lg,
  marginBottom: SPACING.base,
  ...SHADOWS.card,
};

/**
 * Premium Card Elevated Style
 */
export const CARD_ELEVATED: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.xl,
  padding: SPACING.lg,
  marginBottom: SPACING.base,
  ...SHADOWS.lg,
};

/**
 * Screen Container Style
 */
export const SCREEN_CONTAINER: ViewStyle = {
  flex: 1,
  backgroundColor: COLORS.background,
};

/**
 * Content Container with Padding
 */
export const CONTENT_CONTAINER: ViewStyle = {
  padding: SPACING.lg,
};

/**
 * Premium Header Style
 */
export const HEADER_STYLE: ViewStyle = {
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.xl,
  backgroundColor: COLORS.primary,
};

/**
 * Premium Button Styles - Primary, Secondary, Accent, Outline, Ghost, Glass
 */
export const BUTTON_STYLES = {
  primary: {
    container: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
      ...SHADOWS.sm,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.white,
    },
  },
  accent: {
    container: {
      backgroundColor: COLORS.accent,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
      ...SHADOWS.glow,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.primary,
    },
  },
  secondary: {
    container: {
      backgroundColor: COLORS.secondary,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
      ...SHADOWS.sm,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.white,
    },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.primary,
    },
  },
  outlineAccent: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.accent,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.accent,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.primary,
    },
  },
  glass: {
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 48,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.white,
    },
  },
  small: {
    container: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.base,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 36,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.white,
    },
  },
};

/**
 * Premium Input Field Style
 * Note: fontSize and color should be applied separately as TextStyle on TextInput
 */
export const INPUT_STYLE: ViewStyle = {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: RADIUS.lg,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.base,
  backgroundColor: COLORS.gray50,
  minHeight: 48,
};

/**
 * Input Text Style (for TextInput styling)
 */
export const INPUT_TEXT_STYLE: TextStyle = {
  fontSize: TYPOGRAPHY.fontSize.base,
  color: COLORS.text,
};

/**
 * Input Label Style
 */
export const LABEL_STYLE: TextStyle = {
  fontSize: TYPOGRAPHY.fontSize.xs,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  letterSpacing: TYPOGRAPHY.letterSpacing.caps,
  textTransform: 'uppercase',
  marginBottom: SPACING.sm,
  color: COLORS.textTertiary,
};

/**
 * Section Header Style
 */
export const SECTION_HEADER: TextStyle = {
  ...TYPOGRAPHY.styles.h2,
  marginTop: SPACING.xl,
  marginBottom: SPACING.base,
  color: COLORS.text,
};

/**
 * Premium Divider Style
 */
export const DIVIDER: ViewStyle = {
  height: 1,
  backgroundColor: COLORS.border,
  marginVertical: SPACING.base,
};

/**
 * Avatar Styles
 */
export const AVATAR_STYLES = {
  xs: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  xlarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  xxlarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
};

/**
 * Premium Badge/Chip Style
 */
export const BADGE_STYLE: ViewStyle = {
  backgroundColor: COLORS.accent,
  borderRadius: RADIUS.full,
  paddingHorizontal: SPACING.sm,
  paddingVertical: SPACING.xxs,
  alignSelf: 'flex-start' as const,
};

/**
 * Premium Tab Bar Style
 */
export const TAB_BAR_STYLE: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderTopWidth: 0,
  paddingBottom: SPACING.sm,
  borderRadius: RADIUS['3xl'],
  marginHorizontal: SPACING.base,
  ...SHADOWS.lg,
};

/**
 * Modal Backdrop Style
 */
export const MODAL_BACKDROP: ViewStyle = {
  flex: 1,
  backgroundColor: COLORS.overlay || 'rgba(10, 37, 64, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * Premium Modal Container Style
 */
export const MODAL_CONTAINER: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS['2xl'],
  padding: SPACING.xl,
  width: '90%',
  maxWidth: 400,
  ...SHADOWS.xl,
};

/**
 * Premium Bottom Sheet Style
 */
export const BOTTOM_SHEET: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderTopLeftRadius: RADIUS['3xl'],
  borderTopRightRadius: RADIUS['3xl'],
  paddingTop: SPACING.sm,
  ...SHADOWS['2xl'],
};

/**
 * Empty State Style
 */
export const EMPTY_STATE: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: SPACING['2xl'],
};

/**
 * Loading Container Style
 */
export const LOADING_CONTAINER: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.background,
};

/**
 * Premium List Item Style
 */
export const LIST_ITEM: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.base,
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.lg,
  marginBottom: SPACING.sm,
};

/**
 * Premium Stat Card
 */
export const STAT_CARD: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.xl,
  padding: SPACING.lg,
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 100,
  ...SHADOWS.card,
};

/**
 * Helper function to create consistent margins
 */
export const margins = {
  top: (size: keyof typeof SPACING) => ({ marginTop: SPACING[size] }),
  bottom: (size: keyof typeof SPACING) => ({ marginBottom: SPACING[size] }),
  left: (size: keyof typeof SPACING) => ({ marginLeft: SPACING[size] }),
  right: (size: keyof typeof SPACING) => ({ marginRight: SPACING[size] }),
  horizontal: (size: keyof typeof SPACING) => ({
    marginLeft: SPACING[size],
    marginRight: SPACING[size]
  }),
  vertical: (size: keyof typeof SPACING) => ({
    marginTop: SPACING[size],
    marginBottom: SPACING[size]
  }),
  all: (size: keyof typeof SPACING) => ({ margin: SPACING[size] }),
};

/**
 * Helper function to create consistent padding
 */
export const paddings = {
  top: (size: keyof typeof SPACING) => ({ paddingTop: SPACING[size] }),
  bottom: (size: keyof typeof SPACING) => ({ paddingBottom: SPACING[size] }),
  left: (size: keyof typeof SPACING) => ({ paddingLeft: SPACING[size] }),
  right: (size: keyof typeof SPACING) => ({ paddingRight: SPACING[size] }),
  horizontal: (size: keyof typeof SPACING) => ({
    paddingLeft: SPACING[size],
    paddingRight: SPACING[size]
  }),
  vertical: (size: keyof typeof SPACING) => ({
    paddingTop: SPACING[size],
    paddingBottom: SPACING[size]
  }),
  all: (size: keyof typeof SPACING) => ({ padding: SPACING[size] }),
};

/**
 * Floating Action Button (FAB) Constants
 * Premium positioned above bottom navigation
 */
export const FAB_CONSTANTS = {
  BOTTOM_POSITION: 100,
  SIZE: 60,
  ICON_SIZE: 26,
};

/**
 * Premium FAB Style - Floating Action Button
 */
export const FAB_STYLE: ViewStyle = {
  position: 'absolute',
  bottom: FAB_CONSTANTS.BOTTOM_POSITION,
  right: SPACING.lg,
  width: FAB_CONSTANTS.SIZE,
  height: FAB_CONSTANTS.SIZE,
  borderRadius: FAB_CONSTANTS.SIZE / 2,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.accent,
  ...SHADOWS.glow,
};

/**
 * Premium Header Gradient Config
 */
export const HEADER_GRADIENT = {
  colors: GRADIENTS.ocean.colors,
  start: GRADIENTS.ocean.start,
  end: GRADIENTS.ocean.end,
};

/**
 * Premium Accent Gradient Config
 */
export const ACCENT_GRADIENT = {
  colors: GRADIENTS.gold.colors,
  start: GRADIENTS.gold.start,
  end: GRADIENTS.gold.end,
};

// For backward compatibility with FAB import
export { FAB_CONSTANTS as FAB };
