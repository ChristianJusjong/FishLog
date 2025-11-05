import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
}

export function Logo({ size = 48, variant = 'color', showText = true }: LogoProps) {
  const colors = {
    light: '#FFFFFF',      // White for dark backgrounds
    dark: '#1E3F40',       // Dark Petrol for light backgrounds
    color: '#FF7F3F',      // Vivid Orange - primary brand color
  };

  const color = colors[variant];
  const scale = size / 48; // Base size is 48

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* Fish Hook */}
        <G>
          {/* Hook curve (J-shape) */}
          <Path
            d="M 24 8 L 24 24 Q 24 32, 18 32 Q 14 32, 14 28 Q 14 24, 18 24"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Hook point */}
          <Path
            d="M 18 24 L 16 22"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Hook eye (top loop) */}
          <Circle
            cx="24"
            cy="8"
            r="3"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />

          {/* Water waves (subtle) */}
          <Path
            d="M 10 38 Q 14 36, 18 38 Q 22 40, 26 38 Q 30 36, 34 38 Q 38 40, 42 38"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          <Path
            d="M 8 42 Q 12 40, 16 42 Q 20 44, 24 42 Q 28 40, 32 42 Q 36 44, 40 42"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />
        </G>
      </Svg>

      {showText && (
        <Text style={[styles.logoText, { color }]}>FishLog</Text>
      )}
    </View>
  );
}

export function LogoIcon({ size = 48, variant = 'color' }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} variant={variant} showText={false} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
