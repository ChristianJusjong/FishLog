import React from 'react';
import { View, ViewStyle } from 'react-native';

interface SwipeableScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SwipeableScreen: React.FC<SwipeableScreenProps> = ({ children, style }) => {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
};

export default SwipeableScreen;
