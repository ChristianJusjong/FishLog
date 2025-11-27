// Mock for react-native-maps on web
import React from 'react';
import { View, Text } from 'react-native';

export const MapView = (props) => {
  return (
    <View style={[{ width: '100%', height: '100%', backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, props.style]}>
      <Text style={{ color: '#666' }}>Map View (Web Mock)</Text>
      {props.children}
    </View>
  );
};

export const Marker = (props) => {
  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      <Text>📍</Text>
      {props.children}
    </View>
  );
};

export const Polyline = () => null;
export const Circle = () => null;
export const Polygon = () => null;
export const Callout = (props) => <View>{props.children}</View>;

export const PROVIDER_GOOGLE = 'google';
export const MAP_TYPES = {
  STANDARD: 'standard',
  SATELLITE: 'satellite',
  HYBRID: 'hybrid',
  TERRAIN: 'terrain',
};

export default MapView;
