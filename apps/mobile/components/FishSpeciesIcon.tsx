import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

export interface FishSpeciesIconProps {
  speciesId: string; // f.eks. 'havorred', 'gedde', 'aborre', 'torsk', 'hornfisk', 'fladfisk', etc.
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Authentic Fish Species Vector Icon Component
 * Renders precise, biologically distinctive vector silhouettes for Danish sportfish species.
 */
export default function FishSpeciesIcon({
  speciesId,
  size = 28,
  color = '#F5A623',
  style,
}: FishSpeciesIconProps) {
  const normalizedId = speciesId.toLowerCase().replace(/[^a-z]/g, '');

  const renderSpeciesSvg = () => {
    switch (true) {
      // 1. HAVØRRED / LAKS / ØRRED (Trout & Salmon: Streamlined torpedo, adipose fin, forked tail)
      case normalizedId.includes('havorred') ||
        normalizedId.includes('laks') ||
        normalizedId.includes('oerred') ||
        normalizedId.includes('regnbue') ||
        normalizedId.includes('trout') ||
        normalizedId.includes('salmon'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Main Body */}
            <Path
              d="M 6 16 C 10 10, 22 8, 34 12 C 38 13.5, 42 15, 44 16 C 42 17, 38 18.5, 34 20 C 22 24, 10 22, 6 16 Z"
              fill={color}
              opacity={0.85}
            />
            {/* Dorsal Fin (Rygfinne) */}
            <Path d="M 20 9 L 25 4 L 27 9 Z" fill={color} />
            {/* Adipose Fin (Fedtfinne) */}
            <Path d="M 32 12 L 35 9 L 36 12 Z" fill={color} />
            {/* Forked Caudal Tail (Gaffelhale) */}
            <Path d="M 6 16 L 2 8 L 4 16 L 2 24 Z" fill={color} />
            {/* Pectoral & Ventral Fins */}
            <Path d="M 14 20 L 17 25 L 18 20 Z" fill={color} opacity={0.9} />
            <Path d="M 26 21 L 29 25 L 30 20 Z" fill={color} opacity={0.9} />
            {/* Eye */}
            <Circle cx="40" cy="15" r="1.5" fill="#FFFFFF" />
          </Svg>
        );

      // 2. GEDDE (Pike: Long duck-bill snout, rear dorsal fin, predatory shape)
      case normalizedId.includes('gedde') || normalizedId.includes('pike'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Long duck-bill head & body */}
            <Path
              d="M 6 16 C 10 12, 20 11, 32 13 L 46 14 C 44 16, 42 17, 34 18 C 22 20, 10 19, 6 16 Z"
              fill={color}
              opacity={0.9}
            />
            {/* Rear Dorsal Fin */}
            <Path d="M 12 13 L 15 7 L 18 13 Z" fill={color} />
            {/* Rear Anal Fin */}
            <Path d="M 12 18 L 15 24 L 18 18 Z" fill={color} />
            {/* Powerful Tail */}
            <Path d="M 6 16 L 1 10 L 3 16 L 1 22 Z" fill={color} />
            {/* Jaws & Teeth Accent */}
            <Path d="M 44 14.5 L 36 15.5" stroke="#FFFFFF" strokeWidth="1" />
            {/* Predatory Eye */}
            <Circle cx="40" cy="13.5" r="1.5" fill="#FFFFFF" />
          </Svg>
        );

      // 3. ABORRE (Perch: High-backed, spiny front dorsal fin, vertical stripes)
      case normalizedId.includes('aborre') || normalizedId.includes('perch'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* High arched back body */}
            <Path
              d="M 6 16 C 10 7, 24 6, 36 12 C 40 14, 43 15.5, 44 16 C 42 17.5, 36 24, 24 25 C 12 25, 8 20, 6 16 Z"
              fill={color}
              opacity={0.85}
            />
            {/* Spiny Dorsal Fin with peaks */}
            <Path
              d="M 16 10 L 19 3 L 23 5 L 27 4 L 30 11 Z"
              fill={color}
            />
            {/* Tail */}
            <Path d="M 6 16 L 2 9 L 4 16 L 2 23 Z" fill={color} />
            {/* Vertical Tiger Stripes */}
            <Path d="M 20 10 L 21 22" stroke="#000000" strokeWidth="1.5" opacity={0.35} />
            <Path d="M 26 9 L 27 22" stroke="#000000" strokeWidth="1.5" opacity={0.35} />
            <Path d="M 32 11 L 33 20" stroke="#000000" strokeWidth="1.5" opacity={0.35} />
            {/* Eye */}
            <Circle cx="39" cy="14" r="1.6" fill="#FFFFFF" />
          </Svg>
        );

      // 4. SANDART (Zander: Sleek predatory perch with fang profile)
      case normalizedId.includes('sandart') || normalizedId.includes('zander'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            <Path
              d="M 6 16 C 10 9, 24 8, 36 12 L 45 15 C 43 17, 36 22, 24 22 C 12 22, 8 19, 6 16 Z"
              fill={color}
              opacity={0.88}
            />
            {/* Double spiny dorsal fins */}
            <Path d="M 16 10 L 20 4 L 24 9 Z" fill={color} />
            <Path d="M 26 9 L 30 5 L 33 11 Z" fill={color} />
            <Path d="M 6 16 L 2 8 L 4 16 L 2 24 Z" fill={color} />
            <Circle cx="40" cy="13.5" r="1.6" fill="#FFFFFF" />
          </Svg>
        );

      // 5. TORSK (Cod: Chin barbel, 3 dorsal fins, robust body)
      case normalizedId.includes('torsk') || normalizedId.includes('cod'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Deep belly & overbite */}
            <Path
              d="M 6 16 C 10 10, 22 9, 34 11 C 39 12, 43 14, 44 15 C 41 17, 34 23, 22 23 C 12 23, 8 19, 6 16 Z"
              fill={color}
              opacity={0.88}
            />
            {/* 3 Distinct Dorsal Fins */}
            <Path d="M 15 12 L 18 7 L 21 11 Z" fill={color} />
            <Path d="M 23 11 L 26 7 L 29 11 Z" fill={color} />
            <Path d="M 31 11 L 34 8 L 36 12 Z" fill={color} />
            {/* Chin Barbel (Skægtråd) */}
            <Path d="M 41 18 L 40 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Square tail */}
            <Path d="M 6 16 L 2 11 L 3 16 L 2 21 Z" fill={color} />
            {/* Eye */}
            <Circle cx="39" cy="13.5" r="1.6" fill="#FFFFFF" />
          </Svg>
        );

      // 6. HORNFISK (Garfish / Needlefish: Ultra-slender eel-like body with long thin beak)
      case normalizedId.includes('hornfisk') || normalizedId.includes('garfish') || normalizedId.includes('needle'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Very long, slender needle body & beak */}
            <Path
              d="M 6 16 C 12 14, 26 14, 34 15 L 48 15.5 L 34 16.5 C 26 17, 12 17, 6 16 Z"
              fill={color}
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Tiny rear fin */}
            <Path d="M 12 14 L 14 10 L 16 14 Z" fill={color} />
            {/* Beak point */}
            <Path d="M 48 15.5 L 36 15" stroke="#FFFFFF" strokeWidth="1" />
            {/* Scissor Tail */}
            <Path d="M 6 16 L 1 11 L 3 16 L 1 21 Z" fill={color} />
            <Circle cx="34" cy="14.5" r="1.3" fill="#FFFFFF" />
          </Svg>
        );

      // 7. MAKREL (Mackerel: High-speed torpedo with finlets & zebra stripes)
      case normalizedId.includes('makrel') || normalizedId.includes('mackerel'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Sleek torpedo */}
            <Path
              d="M 6 16 C 12 11, 24 10, 36 13 L 45 16 L 36 18 C 24 21, 12 20, 6 16 Z"
              fill={color}
              opacity={0.9}
            />
            <Path d="M 22 10 L 25 5 L 28 10 Z" fill={color} />
            {/* Dorsal Tiger stripes */}
            <Path d="M 18 12 L 20 16" stroke="#000000" strokeWidth="1.2" opacity={0.4} />
            <Path d="M 24 11 L 26 16" stroke="#000000" strokeWidth="1.2" opacity={0.4} />
            <Path d="M 30 12 L 32 16" stroke="#000000" strokeWidth="1.2" opacity={0.4} />
            {/* Forked crescent tail */}
            <Path d="M 6 16 L 1 7 L 3 16 L 1 25 Z" fill={color} />
            <Circle cx="40" cy="15" r="1.4" fill="#FFFFFF" />
          </Svg>
        );

      // 8. FLADFISK / RØDSPÆTTE / SKRUBBE / PIGHVAR (Flatfish: Oval disc, both eyes on top side)
      case normalizedId.includes('fladfisk') ||
        normalizedId.includes('rodspaette') ||
        normalizedId.includes('skrubbe') ||
        normalizedId.includes('pighvar') ||
        normalizedId.includes('tunge'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            {/* Flat oval disc body */}
            <Ellipse cx="24" cy="16" rx="16" ry="10" fill={color} opacity={0.88} />
            {/* Continuous Top and Bottom Fin Fringes */}
            <Path
              d="M 12 6 C 20 4, 28 4, 36 6 L 34 8 C 28 7, 20 7, 14 8 Z"
              fill={color}
            />
            <Path
              d="M 12 26 C 20 28, 28 28, 36 26 L 34 24 C 28 25, 20 25, 14 24 Z"
              fill={color}
            />
            {/* Rounded tail */}
            <Path d="M 8 16 L 2 11 L 4 16 L 2 21 Z" fill={color} />
            {/* Both eyes on upper side */}
            <Circle cx="35" cy="13" r="1.5" fill="#FFFFFF" />
            <Circle cx="36.5" cy="16" r="1.5" fill="#FFFFFF" />
            {/* Distinctive Orange Spots (Rødspætte) */}
            <Circle cx="20" cy="14" r="1.2" fill="#FF5722" />
            <Circle cx="26" cy="17" r="1.2" fill="#FF5722" />
            <Circle cx="16" cy="18" r="1.2" fill="#FF5722" />
          </Svg>
        );

      // 9. KARPE / BRASEN / SUDER / SKALLE (Carp & Bream: Deep bodied, arched scales, barbels)
      case normalizedId.includes('karpe') ||
        normalizedId.includes('brasen') ||
        normalizedId.includes('suder') ||
        normalizedId.includes('skalle'):
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            <Path
              d="M 6 16 C 10 7, 22 5, 34 11 C 38 13, 42 15, 43 17 C 41 18, 36 25, 22 25 C 10 25, 8 20, 6 16 Z"
              fill={color}
              opacity={0.88}
            />
            {/* Long dorsal fin */}
            <Path d="M 16 9 C 22 6, 28 7, 32 11 L 18 10 Z" fill={color} />
            <Path d="M 6 16 L 2 9 L 4 16 L 2 23 Z" fill={color} />
            {/* Mouth barbels */}
            <Path d="M 42 19 L 43 23" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Circle cx="38" cy="14" r="1.6" fill="#FFFFFF" />
          </Svg>
        );

      // 10. DEFAULT / GENERIC SPORTFISH
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 48 32" fill="none">
            <Path
              d="M 6 16 C 10 10, 22 8, 34 12 C 38 13.5, 42 15, 44 16 C 42 17, 38 18.5, 34 20 C 22 24, 10 22, 6 16 Z"
              fill={color}
              opacity={0.85}
            />
            <Path d="M 20 9 L 25 4 L 27 9 Z" fill={color} />
            <Path d="M 6 16 L 2 8 L 4 16 L 2 24 Z" fill={color} />
            <Circle cx="40" cy="15" r="1.5" fill="#FFFFFF" />
          </Svg>
        );
    }
  };

  return <View style={style}>{renderSpeciesSvg()}</View>;
}
