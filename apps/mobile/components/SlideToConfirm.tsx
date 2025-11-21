import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/branding';

interface SlideToConfirmProps {
  onConfirm: () => void;
  text?: string;
  confirmThreshold?: number; // 0-1, default 0.8
  containerStyle?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - SPACING.lg * 4;
const THUMB_SIZE = 60;
const TRACK_HEIGHT = 70;

export default function SlideToConfirm({
  onConfirm,
  text = 'Slide for at stoppe session',
  confirmThreshold = 0.8,
  containerStyle,
}: SlideToConfirmProps) {
  const { colors } = useTheme();
  const [confirmed, setConfirmed] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;
  const maxSlide = SLIDER_WIDTH - THUMB_SIZE;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (confirmed) return;

        // Constrain to slider bounds
        const newValue = Math.max(0, Math.min(gestureState.dx, maxSlide));
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (confirmed) return;

        const slidePercentage = gestureState.dx / maxSlide;

        if (slidePercentage >= confirmThreshold) {
          // Confirmed - slide to end and trigger callback
          Animated.spring(pan, {
            toValue: maxSlide,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start(() => {
            setConfirmed(true);
            onConfirm();
          });
        } else {
          // Not confirmed - slide back to start
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const opacity = pan.interpolate({
    inputRange: [0, maxSlide * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = pan.interpolate({
    inputRange: [0, maxSlide * confirmThreshold],
    outputRange: [colors.error + '20', colors.success + '40'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor,
            borderColor: colors.border,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.text,
            {
              color: colors.textSecondary,
              opacity,
            },
          ]}
        >
          {text}
        </Animated.Text>

        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: confirmed ? colors.success : colors.error,
              transform: [{ translateX: pan }],
            },
            SHADOWS.lg,
          ]}
          {...panResponder.panHandlers}
        >
          <Ionicons
            name={confirmed ? 'checkmark' : 'chevron-forward'}
            size={32}
            color={colors.white}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  track: {
    width: SLIDER_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '600',
    position: 'absolute',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
