/**
 * Hook App - Modern Design System
 * Consolidated theme with consistent spacing, colors, typography, and components
 */

import { TextStyle, ViewStyle } from 'react-native';
import { COLORS, DARK_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from './branding';

// Re-export branding constants
export { COLORS, DARK_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS };

/**
 * Common Card Style - Used across all screens
 */
export const CARD_STYLE: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.lg,
  padding: SPACING.lg,
  marginBottom: SPACING.md,
  ...SHADOWS.md,
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
 * Button Styles - Primary, Secondary, Outline, Ghost
 */
export const BUTTON_STYLES = {
  primary: {
    container: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
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
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...SHADOWS.sm,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.white,
    },
  },
  secondary: {
    container: {
      backgroundColor: COLORS.secondary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
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
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.primary,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.primary,
    },
  },
};

/**
 * Input Field Style
 */
export const INPUT_STYLE: ViewStyle = {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: RADIUS.md,
  padding: SPACING.md,
  backgroundColor: COLORS.surface,
  fontSize: TYPOGRAPHY.fontSize.base,
  color: COLORS.text,
};

/**
 * Input Label Style
 */
export const LABEL_STYLE: TextStyle = {
  ...TYPOGRAPHY.styles.small,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  marginBottom: SPACING.xs,
  color: COLORS.textPrimary,
};

/**
 * Section Header Style
 */
export const SECTION_HEADER: TextStyle = {
  ...TYPOGRAPHY.styles.h2,
  marginTop: SPACING.lg,
  marginBottom: SPACING.md,
  color: COLORS.textPrimary,
};

/**
 * Divider Style
 */
export const DIVIDER: ViewStyle = {
  height: 1,
  backgroundColor: COLORS.border,
  marginVertical: SPACING.md,
};

/**
 * Avatar Styles
 */
export const AVATAR_STYLES = {
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  xlarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
};

/**
 * Badge/Chip Style
 */
export const BADGE_STYLE: ViewStyle = {
  backgroundColor: COLORS.primaryLight,
  borderRadius: RADIUS.full,
  paddingHorizontal: SPACING.sm,
  paddingVertical: SPACING.xs,
  alignSelf: 'flex-start' as const,
};

/**
 * Tab Bar Style
 */
export const TAB_BAR_STYLE: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
  paddingBottom: SPACING.xs,
  ...SHADOWS.sm,
};

/**
 * Modal Backdrop Style
 */
export const MODAL_BACKDROP: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * Modal Container Style
 */
export const MODAL_CONTAINER: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.xl,
  padding: SPACING.xl,
  width: '90%',
  maxWidth: 400,
  ...SHADOWS.xl,
};

/**
 * Empty State Style
 */
export const EMPTY_STATE: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: SPACING.xl,
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
 * Consistent positioning across all screens
 */
export const FAB = {
  // Bottom navigation bar is 60px, so 100px above = 160px from bottom
  BOTTOM_POSITION: 160,
  SIZE: 56,
  ICON_SIZE: 28,
};

/**
 * FAB Style - Floating Action Button
 */
export const FAB_STYLE: ViewStyle = {
  position: 'absolute',
  bottom: FAB.BOTTOM_POSITION,
  right: SPACING.lg,
  width: FAB.SIZE,
  height: FAB.SIZE,
  borderRadius: FAB.SIZE / 2,
  justifyContent: 'center',
  alignItems: 'center',
  ...SHADOWS.lg,
  elevation: 8,
};
