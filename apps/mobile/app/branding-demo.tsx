import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Logo, LogoIcon } from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import {
  BRANDING,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  BUTTON_VARIANTS,
} from '../constants/branding';

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: SPACING.lg,
    },
    section: {
      marginBottom: SPACING['2xl'],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.primary,
      marginBottom: SPACING.md,
    },
    subsectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    logoRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.surface,
      marginBottom: SPACING.sm,
    },
    logoContainer: {
      alignItems: 'center',
    },
    caption: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    colorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    colorBox: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: SPACING.xs,
    },
    colorSwatch: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    colorValue: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
    },
    typographyExample: {
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    button: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    cardBody: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    spacingContainer: {
      flexDirection: 'column',
      gap: SPACING.sm,
    },
    spacingBox: {
      backgroundColor: colors.accent,
      height: 40,
      borderRadius: RADIUS.sm,
      justifyContent: 'center',
      paddingLeft: SPACING.sm,
    },
    spacingLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.white,
    },
    infoCard: {
      backgroundColor: colors.surface,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.sm,
    },
    infoLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    infoValue: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.text,
    },
  });
};

export default function BrandingDemoScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'FishLog Branding Demo' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Variants</Text>

          <View style={styles.logoRow}>
            <View style={styles.logoContainer}>
              <Logo size={64} variant="color" showText={true} />
              <Text style={styles.caption}>Color (Orange)</Text>
            </View>

            <View style={styles.logoContainer}>
              <Logo size={64} variant="dark" showText={true} />
              <Text style={styles.caption}>Dark (Petrol)</Text>
            </View>
          </View>

          <View style={[styles.logoRow, { backgroundColor: colors.primary }]}>
            <View style={styles.logoContainer}>
              <Logo size={64} variant="light" showText={true} />
              <Text style={[styles.caption, { color: colors.white }]}>
                Light (White)
              </Text>
            </View>

            <View style={styles.logoContainer}>
              <LogoIcon size={48} variant="color" />
              <Text style={[styles.caption, { color: colors.white }]}>
                Icon Only
              </Text>
            </View>
          </View>
        </View>

        {/* Color Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>

          <Text style={styles.subsectionTitle}>Primary Colors</Text>
          <View style={styles.colorRow}>
            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.primary }]}
              />
              <Text style={styles.colorLabel}>Primary</Text>
              <Text style={styles.colorValue}>{COLORS.primary}</Text>
            </View>

            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.accent }]}
              />
              <Text style={styles.colorLabel}>Accent</Text>
              <Text style={styles.colorValue}>{COLORS.accent}</Text>
            </View>

            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.secondary }]}
              />
              <Text style={styles.colorLabel}>Secondary</Text>
              <Text style={styles.colorValue}>{COLORS.secondary}</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Nature Colors</Text>
          <View style={styles.colorRow}>
            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.forest }]}
              />
              <Text style={styles.colorLabel}>Forest</Text>
              <Text style={styles.colorValue}>{COLORS.forest}</Text>
            </View>

            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.sand }]}
              />
              <Text style={styles.colorLabel}>Sand</Text>
              <Text style={styles.colorValue}>{COLORS.sand}</Text>
            </View>

            <View style={styles.colorBox}>
              <View
                style={[styles.colorSwatch, { backgroundColor: COLORS.water }]}
              />
              <Text style={styles.colorLabel}>Water</Text>
              <Text style={styles.colorValue}>{COLORS.water}</Text>
            </View>
          </View>
        </View>

        {/* Typography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography</Text>

          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize['4xl'] }]}>
            Heading 1
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize['3xl'] }]}>
            Heading 2
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize['2xl'] }]}>
            Heading 3
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize.xl }]}>
            Large Text
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize.base }]}>
            Body Text (Base)
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize.sm }]}>
            Small Text
          </Text>
          <Text style={[styles.typographyExample, { fontSize: TYPOGRAPHY.fontSize.xs }]}>
            Extra Small Text
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Variants</Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: BUTTON_VARIANTS.primary.backgroundColor },
            ]}
          >
            <Text style={[styles.buttonText, { color: BUTTON_VARIANTS.primary.color }]}>
              Primary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: BUTTON_VARIANTS.accent.backgroundColor },
            ]}
          >
            <Text style={[styles.buttonText, { color: BUTTON_VARIANTS.accent.color }]}>
              Accent Button (CTA)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: BUTTON_VARIANTS.secondary.backgroundColor },
            ]}
          >
            <Text style={[styles.buttonText, { color: BUTTON_VARIANTS.secondary.color }]}>
              Secondary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: BUTTON_VARIANTS.outline.backgroundColor,
                borderWidth: 2,
                borderColor: BUTTON_VARIANTS.outline.borderColor,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: BUTTON_VARIANTS.outline.color }]}>
              Outline Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: BUTTON_VARIANTS.ghost.backgroundColor },
            ]}
          >
            <Text style={[styles.buttonText, { color: BUTTON_VARIANTS.ghost.color }]}>
              Ghost Button
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards & Shadows</Text>

          <View style={[styles.card, SHADOWS.sm]}>
            <Text style={styles.cardTitle}>Small Shadow</Text>
            <Text style={styles.cardBody}>Subtle elevation for flat cards</Text>
          </View>

          <View style={[styles.card, SHADOWS.md]}>
            <Text style={styles.cardTitle}>Medium Shadow</Text>
            <Text style={styles.cardBody}>Default shadow for most cards</Text>
          </View>

          <View style={[styles.card, SHADOWS.lg]}>
            <Text style={styles.cardTitle}>Large Shadow</Text>
            <Text style={styles.cardBody}>Elevated cards and modals</Text>
          </View>

          <View style={[styles.card, SHADOWS.xl]}>
            <Text style={styles.cardTitle}>Extra Large Shadow</Text>
            <Text style={styles.cardBody}>Maximum elevation for popups</Text>
          </View>
        </View>

        {/* Spacing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spacing Scale</Text>

          <View style={styles.spacingContainer}>
            <View style={[styles.spacingBox, { width: SPACING.xs }]}>
              <Text style={styles.spacingLabel}>XS (4px)</Text>
            </View>
            <View style={[styles.spacingBox, { width: SPACING.sm }]}>
              <Text style={styles.spacingLabel}>SM (8px)</Text>
            </View>
            <View style={[styles.spacingBox, { width: SPACING.md }]}>
              <Text style={styles.spacingLabel}>MD (16px)</Text>
            </View>
            <View style={[styles.spacingBox, { width: SPACING.lg }]}>
              <Text style={styles.spacingLabel}>LG (24px)</Text>
            </View>
            <View style={[styles.spacingBox, { width: SPACING.xl }]}>
              <Text style={styles.spacingLabel}>XL (32px)</Text>
            </View>
          </View>
        </View>

        {/* Branding Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Identity</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>App Name:</Text>
            <Text style={styles.infoValue}>{BRANDING.appName}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tagline:</Text>
            <Text style={styles.infoValue}>{BRANDING.tagline}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{BRANDING.description}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
