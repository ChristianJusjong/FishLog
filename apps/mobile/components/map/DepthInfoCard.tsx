import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type DepthInfoCardProps = {
  depthInfo: { depth: number | null; waterName: string | null; coords: { latitude: number; longitude: number } } | null;
  setDepthInfo: (info: any) => void;
  loadingDepthInfo: boolean;
};

export default function DepthInfoCard({ depthInfo, setDepthInfo, loadingDepthInfo }: DepthInfoCardProps) {
  const { colors } = useTheme();

  if (!depthInfo) return null;

  return (
    <View style={[styles.depthInfoCard, { backgroundColor: colors.surface }]}>
      <View style={styles.depthInfoHeader}>
        <Ionicons name="water" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.depthInfoTitle}>{depthInfo.waterName}</Text>
        <TouchableOpacity onPress={() => setDepthInfo(null)} style={{ marginLeft: 'auto' }}>
          <Ionicons name="close-circle" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {loadingDepthInfo ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
      ) : (
        <>
          {depthInfo.depth !== null ? (
            <View style={styles.depthInfoContent}>
              <Text style={styles.depthInfoLabel}>Dybde:</Text>
              <Text style={[styles.depthInfoValue, { color: colors.primary }]}>{depthInfo.depth}cm</Text>
            </View>
          ) : (
            <Text style={styles.depthInfoNoData}>Dybdedata ikke tilgængelig for dette område</Text>
          )}
          <View style={styles.depthInfoCoords}>
            <Text style={styles.depthInfoCoordsText}>
              {depthInfo.coords.latitude.toFixed(4)}°N, {depthInfo.coords.longitude.toFixed(4)}°Ø
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  depthInfoCard: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 3000,
  },
  depthInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  depthInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  depthInfoContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  depthInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  depthInfoValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  depthInfoNoData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  depthInfoCoords: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  depthInfoCoordsText: {
    fontSize: 12,
    color: '#999',
  },
});
