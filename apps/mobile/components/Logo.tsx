import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';

export interface LogoProps {
  size?: number;
  variant?: 'color' | 'light' | 'dark' | 'gold' | 'monochrome';
  layout?: 'vertical' | 'horizontal' | 'icon';
  showText?: boolean;
  subtitle?: string;
}

/**
 * Hook App - Authentic Precision Fishing Hook Brand Logo
 * Features a realistic, forged high-carbon steel fishing hook with eyelet, shank, bend, and barbed point.
 */
export function Logo({
  size = 48,
  variant = 'color',
  layout = 'vertical',
  showText = true,
  subtitle = 'SMART ANGLING',
}: LogoProps) {
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          hookPrimary: '#FFFFFF',
          hookSecondary: '#00D4B2',
          hookAccent: '#F5A623',
          text: '#FFFFFF',
          subtext: '#94A3B8',
          bgBorder: 'rgba(255, 255, 255, 0.15)',
        };
      case 'dark':
        return {
          hookPrimary: '#0A2540',
          hookSecondary: '#00D4B2',
          hookAccent: '#F5A623',
          text: '#0A2540',
          subtext: '#64748B',
          bgBorder: 'rgba(10, 37, 64, 0.15)',
        };
      case 'gold':
        return {
          hookPrimary: '#F5A623',
          hookSecondary: '#FFD700',
          hookAccent: '#D97706',
          text: '#F5A623',
          subtext: '#FCD34D',
          bgBorder: 'rgba(245, 166, 35, 0.2)',
        };
      case 'monochrome':
        return {
          hookPrimary: '#64748B',
          hookSecondary: '#94A3B8',
          hookAccent: '#CBD5E1',
          text: '#334155',
          subtext: '#94A3B8',
          bgBorder: 'rgba(100, 116, 139, 0.15)',
        };
      case 'color':
      default:
        return {
          hookPrimary: '#F5A623',
          hookSecondary: '#00D4B2',
          hookAccent: '#FFD700',
          text: '#0A2540',
          subtext: '#64748B',
          bgBorder: 'rgba(245, 166, 35, 0.2)',
        };
    }
  };

  const c = getColors();
  const isHorizontal = layout === 'horizontal';
  const isIconOnly = layout === 'icon' || !showText;

  return (
    <View style={[styles.container, isHorizontal ? styles.horizontalContainer : styles.verticalContainer]}>
      {/* Precision Vector Hook Emblem */}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Defs>
            {/* Forged Titanium / Gold Gradient */}
            <LinearGradient id="hookSteelGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFD700" />
              <Stop offset="45%" stopColor="#F5A623" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>

            {/* Ocean Neon Teal Gradient */}
            <LinearGradient id="tealGlowGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#00D4B2" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>

            {/* Emblem Badge Background */}
            <LinearGradient id="badgeBg" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="rgba(10, 37, 64, 0.08)" />
              <Stop offset="100%" stopColor="rgba(0, 212, 178, 0.04)" />
            </LinearGradient>
          </Defs>

          {/* Shield Badge Container */}
          <Rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#badgeBg)"
            stroke={c.bgBorder}
            strokeWidth="1.2"
          />

          <G>
            {/* Water Ripple Accent Arc behind Hook */}
            <Path
              d="M 10 26 C 14 31, 20 33, 27 30 C 33 27, 37 30, 40 33"
              stroke={variant === 'light' ? 'rgba(255,255,255,0.25)' : 'url(#tealGlowGrad)'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity={0.8}
            />

            {/* Real Fishing Hook Eyelet (Top loop where line is tied) */}
            <Circle
              cx="26"
              cy="9"
              r="3.5"
              stroke={variant === 'light' ? '#FFFFFF' : 'url(#hookSteelGrad)'}
              strokeWidth="2.8"
              fill="none"
            />

            {/* Hook Eyelet Center Hole */}
            <Circle
              cx="26"
              cy="9"
              r="1.2"
              fill={variant === 'light' ? '#0A2540' : '#FFFFFF'}
              opacity={0.3}
            />

            {/* Authentic J-Hook: Straight Shank -> Smooth Deep Bend -> Razor Point */}
            <Path
              d="M 26 12.5 L 26 27 C 26 35, 14 36.5, 13 28 L 13 18"
              stroke={variant === 'light' ? '#FFFFFF' : 'url(#hookSteelGrad)'}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Sharp Angled Hook Barb (Essential detail on real fishing hooks) */}
            <Path
              d="M 13 22 L 16.5 24.5"
              stroke={variant === 'light' ? '#FFFFFF' : 'url(#hookSteelGrad)'}
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Needle-Sharp Point Taper */}
            <Path
              d="M 13 19 L 13 17"
              stroke={variant === 'light' ? '#00D4B2' : '#00D4B2'}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Catch Flash Highlight Star */}
            <Circle
              cx="36"
              cy="12"
              r="2"
              fill={variant === 'light' ? '#F5A623' : '#00D4B2'}
            />
          </G>
        </Svg>
      </View>

      {/* Typography Brand Lockup */}
      {!isIconOnly && (
        <View style={isHorizontal ? styles.horizontalTextWrapper : styles.verticalTextWrapper}>
          <Text
            style={[
              styles.brandText,
              {
                color: c.text,
                fontSize: Math.max(18, Math.round(size * (isHorizontal ? 0.48 : 0.42))),
                letterSpacing: 2,
              },
            ]}
          >
            HOOK
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subText,
                {
                  color: c.subtext,
                  fontSize: Math.max(9, Math.round(size * (isHorizontal ? 0.2 : 0.18))),
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

/**
 * Compact Icon-only variant
 */
export function LogoIcon({ size = 48, variant = 'color' }: Omit<LogoProps, 'layout' | 'showText' | 'subtitle'>) {
  return <Logo size={size} variant={variant} layout="icon" showText={false} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  verticalTextWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  horizontalTextWrapper: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '900',
    fontFamily: 'System',
    textTransform: 'uppercase',
  },
  subText: {
    fontWeight: '700',
    letterSpacing: 2.2,
    marginTop: 1,
    textTransform: 'uppercase',
  },
});
