import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useDynamicStyles } from '@/contexts/ThemeContext';

interface Rank {
  title: string;
  icon: string;
  color: string;
}

interface XPProgressBarProps {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  rank: Rank;
  compact?: boolean;
}

export default function XPProgressBar({
  level,
  currentLevelXP,
  xpForNextLevel,
  rank,
  compact = false,
}: XPProgressBarProps) {
  const styles = useDynamicStyles(createStyles);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = (currentLevelXP / xpForNextLevel) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <View style={styles.compactLevelBadge}>
            <Text style={styles.compactLevelNumber}>{level}</Text>
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactRankTitle}>
              {rank.icon} {rank.title}
            </Text>
            <Text style={styles.compactXPText}>
              {currentLevelXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: progressWidth, backgroundColor: rank.color },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: rank.color }]}>
          <Text style={styles.levelText}>Level</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.rankInfo}>
          <Text style={styles.rankIcon}>{rank.icon}</Text>
          <View>
            <Text style={styles.rankTitle}>{rank.title}</Text>
            <Text style={styles.nextLevel}>Næste: Level {level + 1}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: progressWidth, backgroundColor: rank.color },
          ]}
        />
      </View>

      {/* XP Info */}
      <View style={styles.xpInfo}>
        <Text style={styles.xpText}>
          {currentLevelXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </Text>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    levelBadge: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    levelText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '600',
      opacity: 0.9,
    },
    levelNumber: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    rankInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rankIcon: {
      fontSize: 36,
      marginRight: 12,
    },
    rankTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    nextLevel: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    progressBarContainer: {
      height: 12,
      backgroundColor: theme.border,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 12,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    xpInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    xpText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    percentageText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    // Compact styles
    compactContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
    },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    compactLevelBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    compactLevelNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    compactInfo: {
      flex: 1,
    },
    compactRankTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    compactXPText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });
