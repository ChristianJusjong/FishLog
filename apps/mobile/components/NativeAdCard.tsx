import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { API_URL } from '../config/api';

interface NativeAdProps {
  ad: {
    id: string;
    type: string;
    title: string;
    description?: string;
    imageUrl?: string;
    callToAction: string;
    targetUrl: string;
    sponsorName: string;
    sponsorLogo?: string;
  };
  userId: string;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

export default function NativeAdCard({ ad, userId, onImpression, onClick }: NativeAdProps) {
  const { colors } = useTheme();

  // Track impression on mount
  useEffect(() => {
    trackImpression();
  }, []);

  const trackImpression = async () => {
    try {
      await fetch(`${API_URL}/api/ads/${ad.id}/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          platform: Platform.OS,
          screenType: 'feed',
        }),
      });
      onImpression?.(ad.id);
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  };

  const trackClick = async () => {
    try {
      await fetch(`${API_URL}/api/ads/${ad.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          platform: Platform.OS,
          screenType: 'feed',
        }),
      });
      onClick?.(ad.id);
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handlePress = async () => {
    await trackClick();

    // Open the ad URL
    if (ad.targetUrl) {
      await Linking.openURL(ad.targetUrl);
    }
  };

  const dynamicStyles = {
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    title: {
      color: colors.text,
    },
    description: {
      color: colors.textSecondary,
    },
    sponsorText: {
      color: colors.textSecondary,
    },
    adLabel: {
      color: colors.textSecondary,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.card]}>
      {/* Sponsored label */}
      <View style={styles.sponsoredBadge}>
        <Ionicons name="megaphone-outline" size={12} color={colors.textSecondary} />
        <Text style={[styles.sponsoredText, dynamicStyles.adLabel]}>Sponsoreret</Text>
      </View>

      {/* Sponsor info */}
      <View style={styles.sponsorHeader}>
        {ad.sponsorLogo ? (
          <Image source={{ uri: ad.sponsorLogo }} style={styles.sponsorLogo} />
        ) : (
          <View style={[styles.sponsorLogoPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.sponsorLogoText}>
              {ad.sponsorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.sponsorInfo}>
          <Text style={[styles.sponsorName, dynamicStyles.sponsorText]}>{ad.sponsorName}</Text>
          <Text style={[styles.sponsoredLabel, dynamicStyles.adLabel]}>Sponsoreret annonce</Text>
        </View>
      </View>

      {/* Ad content */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.contentContainer}
      >
        {ad.imageUrl && (
          <Image
            source={{ uri: ad.imageUrl }}
            style={styles.adImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.textContent}>
          <Text style={[styles.title, dynamicStyles.title]} numberOfLines={2}>
            {ad.title}
          </Text>

          {ad.description && (
            <Text style={[styles.description, dynamicStyles.description]} numberOfLines={3}>
              {ad.description}
            </Text>
          )}

          {/* Call to action button */}
          <View style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.ctaText}>{ad.callToAction}</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sponsorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sponsorLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sponsoredLabel: {
    fontSize: 12,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  adImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  textContent: {
    gap: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
