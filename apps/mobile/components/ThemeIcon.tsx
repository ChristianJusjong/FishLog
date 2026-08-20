import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export type IconType =
  | 'hook'
  | 'tide'
  | 'rod'
  | 'reel'
  | 'lure'
  | 'knot'
  | 'species'
  | 'trophy'
  | 'weather'
  | 'radar'
  | 'shield'
  | 'water'
  | 'map'
  | 'active-session';

export interface ThemeIconProps {
  type: IconType;
  size?: number;
  variant?: 'gold' | 'teal' | 'emerald' | 'navy' | 'violet' | 'amber';
  showBadge?: boolean;
  style?: ViewStyle;
}

/**
 * Universal Theme Icon Component
 * Renders precision vector emblems with maritime gradient badge styling for the entire Hook app.
 */
export default function ThemeIcon({
  type,
  size = 24,
  variant = 'gold',
  showBadge = false,
  style,
}: ThemeIconProps) {
  const { colors, isDark } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'teal':
        return {
          primary: '#00D4B2',
          secondary: '#0284C7',
          bg: 'rgba(0, 212, 178, 0.12)',
          border: 'rgba(0, 212, 178, 0.3)',
        };
      case 'emerald':
        return {
          primary: '#10B981',
          secondary: '#059669',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'violet':
        return {
          primary: '#8B5CF6',
          secondary: '#6D28D9',
          bg: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.3)',
        };
      case 'amber':
        return {
          primary: '#F59E0B',
          secondary: '#D97706',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'navy':
        return {
          primary: '#0A2540',
          secondary: '#14385C',
          bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10, 37, 64, 0.08)',
          border: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10, 37, 64, 0.15)',
        };
      case 'gold':
      default:
        return {
          primary: '#F5A623',
          secondary: '#FFB800',
          bg: 'rgba(245, 166, 35, 0.12)',
          border: 'rgba(245, 166, 35, 0.3)',
        };
    }
  };

  const vc = getVariantColors();
  const badgeSize = size * 1.6;

  const renderIconContent = () => {
    switch (type) {
      case 'hook':
        return (
          <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Circle cx="26" cy="9" r="3.5" stroke={vc.primary} strokeWidth="3.2" fill="none" />
            <Path
              d="M 26 12.5 L 26 27 C 26 35, 14 36.5, 13 28 L 13 18"
              stroke={vc.primary}
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M 13 22 L 16.5 24.5"
              stroke={vc.primary}
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        );

      case 'tide':
        return (
          <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Path
              d="M 6 20 C 12 14, 18 26, 24 20 C 30 14, 36 26, 42 20"
              stroke={vc.primary}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M 6 30 C 12 24, 18 36, 24 30 C 30 24, 36 36, 42 30"
              stroke={vc.secondary}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
          </Svg>
        );

      case 'radar':
        return (
          <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Circle cx="24" cy="24" r="18" stroke={vc.primary} strokeWidth="2.5" opacity={0.3} fill="none" />
            <Circle cx="24" cy="24" r="11" stroke={vc.primary} strokeWidth="2.5" opacity={0.6} fill="none" />
            <Circle cx="24" cy="24" r="4" fill={vc.primary} />
            <Path d="M 24 6 L 24 24 L 38 14" stroke={vc.secondary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </Svg>
        );

      case 'shield':
        return (
          <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Path
              d="M 24 6 L 38 12 V 24 C 38 34, 24 42, 24 42 C 24 42, 10 34, 10 24 V 12 L 24 6 Z"
              stroke={vc.primary}
              strokeWidth="3"
              strokeLinejoin="round"
              fill="none"
            />
            <Path d="M 18 24 L 22 28 L 30 18" stroke={vc.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        );

      case 'trophy':
        return <Ionicons name="trophy" size={size} color={vc.primary} />;

      case 'knot':
        return <Ionicons name="git-branch" size={size} color={vc.primary} />;

      case 'rod':
      case 'species':
        return <Ionicons name="fish" size={size} color={vc.primary} />;

      case 'reel':
        return <Ionicons name="disc" size={size} color={vc.primary} />;

      case 'lure':
        return <Ionicons name="flash" size={size} color={vc.primary} />;

      case 'weather':
        return <Ionicons name="partly-sunny" size={size} color={vc.primary} />;

      case 'map':
        return <Ionicons name="map" size={size} color={vc.primary} />;

      case 'active-session':
        return <Ionicons name="pulse" size={size} color={vc.primary} />;

      case 'water':
      default:
        return <Ionicons name="water" size={size} color={vc.primary} />;
    }
  };

  if (showBadge) {
    return (
      <View
        style={[
          styles.badgeContainer,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: vc.bg,
            borderColor: vc.border,
          },
          style,
        ]}
      >
        {renderIconContent()}
      </View>
    );
  }

  return <View style={style}>{renderIconContent()}</View>;
}

const styles = StyleSheet.create({
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
  },
});
