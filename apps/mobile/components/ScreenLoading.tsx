import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Logo } from './Logo';
import { LoadingBar } from './LoadingBar';
import { useTheme } from '../contexts/ThemeContext';

export interface ScreenLoadingProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  transparent?: boolean;
}

/**
 * Hook App - Modern Screen Loading State
 * Displays the Hook brand emblem with dynamic loading bar and informative status text.
 */
export function ScreenLoading({
  message = 'Indlæser...',
  subMessage,
  progress,
  transparent = false,
}: ScreenLoadingProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent
            ? 'transparent'
            : isDark
            ? colors.background
            : colors.backgroundLight,
        },
      ]}
    >
      <View style={styles.contentCard}>
        {/* Modern Brand Logo */}
        <Logo size={64} layout="vertical" variant={isDark ? 'light' : 'color'} />

        {/* Animated Gradient Loading Bar */}
        <View style={styles.loadingBarContainer}>
          <LoadingBar
            progress={progress}
            height={5}
            width={180}
            glow={true}
            colors={['#00D4B2', '#FFB800', '#F97316']}
          />
        </View>

        {/* Status Message */}
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        {subMessage ? (
          <Text style={[styles.subMessage, { color: colors.textSecondary }]}>{subMessage}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  contentCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    maxWidth: 320,
    width: '100%',
  },
  loadingBarContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  message: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subMessage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ScreenLoading;
