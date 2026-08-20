import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useDynamicStyles } from '@/contexts/ThemeContext';

interface Rank {
  title: string;
  icon?: string;
  color: string;
}

interface RankBadgeProps {
  rank: Rank;
  level: number;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
  style?: any;
}

export default function RankBadge({
  rank,
  level,
  size = 'medium',
  showLevel = true,
  style,
}: RankBadgeProps) {
  const styles = useDynamicStyles(createStyles);

  const iconSizes = {
    small: 14,
    medium: 18,
    large: 24,
  };

  const currentIconSize = iconSizes[size];

  const sizeConfig = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      level: styles.levelSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      level: styles.levelMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      level: styles.levelLarge,
    },
  };

  const config = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        config.container,
        { backgroundColor: rank.color + '18', borderColor: rank.color + '40' },
        style,
      ]}
    >
      {/* Vector Shield Emblem */}
      <Svg width={currentIconSize} height={currentIconSize} viewBox="0 0 24 24" fill="none">
        <Path
          d="M 12 2 L 20 5 V 11 C 20 16.5, 12 21, 12 21 C 12 21, 4 16.5, 4 11 V 5 L 12 2 Z"
          fill={rank.color}
          opacity={0.3}
        />
        <Path
          d="M 12 2 L 20 5 V 11 C 20 16.5, 12 21, 12 21 C 12 21, 4 16.5, 4 11 V 5 L 12 2 Z"
          stroke={rank.color}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M 9 11 L 11 13 L 15 9"
          stroke={rank.color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.rankTitle, config.text, { color: rank.color }]} numberOfLines={1}>
          {rank.title}
        </Text>
        {showLevel && (
          <Text style={[styles.levelText, config.level]}>Lvl {level}</Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1.2,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    textContainer: {
      marginLeft: 6,
    },
    rankTitle: {
      fontWeight: '800',
    },
    levelText: {
      color: theme.textSecondary,
      fontWeight: '700',
      fontSize: 10,
    },
    // Small size
    containerSmall: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    textSmall: {
      fontSize: 10,
    },
    levelSmall: {
      fontSize: 8,
    },
    // Medium size
    containerMedium: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    textMedium: {
      fontSize: 12,
    },
    levelMedium: {
      fontSize: 10,
    },
    // Large size
    containerLarge: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 14,
    },
    textLarge: {
      fontSize: 15,
    },
    levelLarge: {
      fontSize: 11,
    },
  });
