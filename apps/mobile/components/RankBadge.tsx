import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDynamicStyles } from '@/contexts/ThemeContext';

interface Rank {
  title: string;
  icon: string;
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

  const sizeConfig = {
    small: {
      container: styles.containerSmall,
      icon: styles.iconSmall,
      text: styles.textSmall,
      level: styles.levelSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: styles.iconMedium,
      text: styles.textMedium,
      level: styles.levelMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: styles.iconLarge,
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
        { backgroundColor: rank.color + '20', borderColor: rank.color },
        style,
      ]}
    >
      <Text style={config.icon}>{rank.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.rankTitle, config.text]} numberOfLines={1}>
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
      borderRadius: 8,
      borderWidth: 1.5,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    textContainer: {
      marginLeft: 6,
    },
    rankTitle: {
      fontWeight: 'bold',
      color: theme.text,
    },
    levelText: {
      color: theme.textSecondary,
      fontWeight: '600',
    },
    // Small size
    containerSmall: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    iconSmall: {
      fontSize: 14,
    },
    textSmall: {
      fontSize: 11,
    },
    levelSmall: {
      fontSize: 9,
    },
    // Medium size
    containerMedium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    iconMedium: {
      fontSize: 18,
    },
    textMedium: {
      fontSize: 13,
    },
    levelMedium: {
      fontSize: 11,
    },
    // Large size
    containerLarge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    iconLarge: {
      fontSize: 24,
    },
    textLarge: {
      fontSize: 16,
    },
    levelLarge: {
      fontSize: 13,
    },
  });
