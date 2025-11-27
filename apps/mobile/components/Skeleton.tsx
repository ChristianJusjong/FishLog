import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | '100%' | '70%' | '50%';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.surfaceVariant : colors.gray200,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CatchCardSkeleton() {
  return (
    <View style={styles.catchCard}>
      <Skeleton height={200} borderRadius={12} />
      <View style={styles.catchCardContent}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function FeedItemSkeleton() {
  return (
    <View style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton height={250} borderRadius={12} style={{ marginTop: 12 }} />
      <View style={styles.feedFooter}>
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profile}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={150} height={20} style={{ marginTop: 12 }} />
      <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
      <View style={styles.profileStats}>
        <Skeleton width={60} height={40} />
        <Skeleton width={60} height={40} />
        <Skeleton width={60} height={40} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={50} height={50} borderRadius={8} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  catchCard: {
    marginBottom: 16,
  },
  catchCardContent: {
    padding: 12,
  },
  feedItem: {
    padding: 16,
    marginBottom: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  profile: {
    alignItems: 'center',
    padding: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default Skeleton;
