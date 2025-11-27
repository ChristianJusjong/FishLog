import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS } from '@/constants/branding';
import { useTheme } from '../../../contexts/ThemeContext';
import { api } from '../../../lib/api';

interface ExifData {
  timestamp?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  device?: {
    make?: string;
    model?: string;
  };
  camera?: {
    iso?: number;
    focalLength?: number;
    exposureTime?: number;
    fNumber?: number;
  };
  dimensions?: {
    width?: number;
    height?: number;
  };
}

interface PhotoMetadata {
  url?: string;
  hash?: string;
  exif?: ExifData;
  gps?: {
    claimed?: { latitude?: number; longitude?: number };
    exif?: { latitude?: number; longitude?: number };
  };
  timestamp?: {
    claimed?: string;
    exif?: string;
  };
  device?: any;
  camera?: any;
  dimensions?: any;
}

interface CatchData {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  species?: string;
  lengthCm?: number;
  weightKg?: number;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  metadata: {
    likeCount: number;
    commentCount: number;
    photoMetadata: PhotoMetadata;
  };
  validation?: {
    status: string;
    reason?: string;
    validatedAt: string;
    validatedBy: {
      id: string;
      name: string;
    };
  };
}

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.backgroundLight,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: SPACING.sm,
      marginRight: SPACING.sm,
    },
    backButtonText: {
      fontSize: 28,
      color: colors.primary,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textPrimary,
    },
    scrollView: {
      flex: 1,
    },
    emptyState: {
      alignItems: 'center' as const,
      paddingVertical: SPACING.xl * 2,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: SPACING.md,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.textSecondary,
    },
    catchCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.md,
      borderRadius: RADIUS.lg,
      overflow: 'hidden' as const,
      ...SHADOWS.md,
    },
    catchPhoto: {
      width: '100%' as const,
      height: 250,
      backgroundColor: colors.backgroundLight,
    },
    userSection: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: SPACING.sm,
    },
    userAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: SPACING.sm,
    },
    userAvatarText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.white,
      fontWeight: '600' as const,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    userEmail: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    catchInfo: {
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    catchSpecies: {
      ...TYPOGRAPHY.styles.h3,
      marginBottom: SPACING.xs,
      color: colors.textPrimary,
    },
    catchStats: {
      flexDirection: 'row' as const,
      gap: SPACING.md,
    },
    catchStat: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    metadataSection: {
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
    },
    metadataTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600' as const,
      marginBottom: SPACING.sm,
      color: colors.textPrimary,
    },
    metadataRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: SPACING.xs,
    },
    metadataLabel: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      flex: 1,
    },
    metadataValue: {
      ...TYPOGRAPHY.styles.body,
      flex: 1,
      textAlign: 'right' as const,
      color: colors.textPrimary,
    },
    metadataValueSmall: {
      ...TYPOGRAPHY.styles.small,
      flex: 1,
      textAlign: 'right' as const,
      fontFamily: 'monospace',
      color: colors.textPrimary,
    },
    metadataWarning: {
      color: colors.error,
      fontWeight: '600' as const,
    },
    validationButtons: {
      flexDirection: 'row' as const,
      padding: SPACING.md,
      gap: SPACING.md,
    },
    approveButton: {
      flex: 1,
      backgroundColor: colors.success,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center' as const,
      ...SHADOWS.sm,
    },
    approveButtonText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.white,
      fontWeight: '600' as const,
    },
    rejectButton: {
      flex: 1,
      backgroundColor: colors.error,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center' as const,
      ...SHADOWS.sm,
    },
    rejectButtonText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.white,
      fontWeight: '600' as const,
    },
    validationStatus: {
      padding: SPACING.md,
      alignItems: 'center' as const,
    },
    validationApproved: {
      backgroundColor: colors.success + '20',
    },
    validationRejected: {
      backgroundColor: colors.error + '20',
    },
    validationStatusText: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    validationReason: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
      fontStyle: 'italic' as const,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      width: '100%' as const,
      maxWidth: 400,
    },
    modalTitle: {
      ...TYPOGRAPHY.styles.h2,
      marginBottom: SPACING.xs,
      textAlign: 'center' as const,
      color: colors.textPrimary,
    },
    modalSubtitle: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      marginBottom: SPACING.lg,
    },
    modalInputContainer: {
      marginBottom: SPACING.lg,
    },
    modalLabel: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '600' as const,
      marginBottom: SPACING.sm,
      color: colors.textPrimary,
    },
    modalInput: {
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      ...TYPOGRAPHY.styles.body,
      minHeight: 80,
      textAlignVertical: 'top' as const,
      color: colors.textPrimary,
    },
    modalButtons: {
      flexDirection: 'row' as const,
      gap: SPACING.md,
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center' as const,
    },
    modalCancelButtonText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textPrimary,
      fontWeight: '600' as const,
    },
    modalConfirmButton: {
      flex: 1,
      backgroundColor: colors.success,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center' as const,
    },
    modalRejectButton: {
      backgroundColor: colors.error,
    },
    modalConfirmButtonText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.white,
      fontWeight: '600' as const,
    },
  });
};

export default function ContestValidationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAuthHeader } = useAuth();
  const router = useRouter();
  const styles = useStyles();

  const [catches, setCatches] = useState<CatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatch, setSelectedCatch] = useState<CatchData | null>(null);
  const [validationMode, setValidationMode] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);



  useEffect(() => {
    fetchContestCatches();
  }, [id]);

  const fetchContestCatches = async () => {
    try {
      const response = await api.get(`/admin/contest-catches?contestId=${id}`);
      setCatches(response.data.catches);
    } catch (error) {
      console.error('Error fetching catches:', error);
      Alert.alert('Fejl', 'Kunne ikke hente fangster');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (catchId: string, status: 'approved' | 'rejected', reason?: string) => {
    setSubmitting(true);
    try {
      await api.post(`/admin/contest-catches/${catchId}/validate`, { status, reason });

      Alert.alert('Succes', `Fangst ${status === 'approved' ? 'godkendt' : 'afvist'}`);
      setSelectedCatch(null);
      setValidationMode(null);
      setRejectReason('');
      fetchContestCatches();
    } catch (error) {
      console.error('Error validating catch:', error);
      Alert.alert('Fejl', 'Kunne ikke validere fangst');
    } finally {
      setSubmitting(false);
    }
  };

  const openValidationModal = (catch_: CatchData, mode: 'approve' | 'reject') => {
    setSelectedCatch(catch_);
    setValidationMode(mode);
  };

  const closeValidationModal = () => {
    setSelectedCatch(null);
    setValidationMode(null);
    setRejectReason('');
  };

  const confirmValidation = () => {
    if (!selectedCatch) return;

    if (validationMode === 'reject' && !rejectReason.trim()) {
      Alert.alert('Fejl', 'Begrundelse er påkrævet ved afvisning');
      return;
    }

    handleValidate(
      selectedCatch.id,
      validationMode === 'approve' ? 'approved' : 'rejected',
      validationMode === 'reject' ? rejectReason : undefined
    );
  };

  const calculateGpsDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const calculateTimeDifference = (date1?: string, date2?: string): number | null => {
    if (!date1 || !date2) return null;
    const diff = Math.abs(new Date(date1).getTime() - new Date(date2).getTime());
    return Math.floor(diff / 1000 / 60);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 Validering</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {catches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✓</Text>
            <Text style={styles.emptyText}>Alle fangster valideret</Text>
          </View>
        ) : (
          catches.map((catch_) => {
            const metadata = catch_.metadata.photoMetadata;
            const gpsDistance = calculateGpsDistance(
              metadata.gps?.claimed?.latitude,
              metadata.gps?.claimed?.longitude,
              metadata.gps?.exif?.latitude,
              metadata.gps?.exif?.longitude
            );
            const timeDiff = calculateTimeDifference(
              metadata.timestamp?.claimed,
              metadata.timestamp?.exif
            );

            const isAlreadyValidated = !!catch_.validation;

            return (
              <View key={catch_.id} style={styles.catchCard}>
                {/* Photo */}
                {catch_.photoUrl && (
                  <Image source={{ uri: catch_.photoUrl }} style={styles.catchPhoto} />
                )}

                {/* User Info */}
                <View style={styles.userSection}>
                  {catch_.user.avatar ? (
                    <Image source={{ uri: catch_.user.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.userAvatarText}>
                        {catch_.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{catch_.user.name}</Text>
                    <Text style={styles.userEmail}>{catch_.user.email}</Text>
                  </View>
                </View>

                {/* Catch Info */}
                <View style={styles.catchInfo}>
                  <Text style={styles.catchSpecies}>{catch_.species || 'Ukendt art'}</Text>
                  <View style={styles.catchStats}>
                    {catch_.weightKg && (
                      <Text style={styles.catchStat}>⚖️ {(catch_.weightKg * 1000).toFixed(0)}g</Text>
                    )}
                    {catch_.lengthCm && (
                      <Text style={styles.catchStat}>📏 {catch_.lengthCm}cm</Text>
                    )}
                  </View>
                </View>

                {/* EXIF Metadata */}
                <View style={styles.metadataSection}>
                  <Text style={styles.metadataTitle}>Metadata</Text>

                  {/* GPS Verification */}
                  {metadata.gps?.exif ? (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>GPS:</Text>
                      <Text
                        style={[
                          styles.metadataValue,
                          gpsDistance !== null && gpsDistance > 100 && styles.metadataWarning,
                        ]}
                      >
                        {gpsDistance !== null ? `${gpsDistance}m forskel` : 'Ingen EXIF GPS'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>GPS:</Text>
                      <Text style={[styles.metadataValue, styles.metadataWarning]}>
                        Ingen EXIF data
                      </Text>
                    </View>
                  )}

                  {/* Timestamp Verification */}
                  {metadata.timestamp?.exif ? (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>🕐 Tidsstempel:</Text>
                      <Text
                        style={[
                          styles.metadataValue,
                          timeDiff !== null && timeDiff > 5 && styles.metadataWarning,
                        ]}
                      >
                        {timeDiff !== null ? `${timeDiff} min forskel` : 'OK'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>🕐 Tidsstempel:</Text>
                      <Text style={[styles.metadataValue, styles.metadataWarning]}>
                        Ingen EXIF data
                      </Text>
                    </View>
                  )}

                  {/* Device Info */}
                  {metadata.device && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>📱 Enhed:</Text>
                      <Text style={styles.metadataValue}>
                        {metadata.device.make} {metadata.device.model}
                      </Text>
                    </View>
                  )}

                  {/* Image Hash */}
                  {metadata.hash && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}># Hash:</Text>
                      <Text style={styles.metadataValueSmall}>
                        {metadata.hash.substring(0, 16)}...
                      </Text>
                    </View>
                  )}
                </View>

                {/* Validation Status or Buttons */}
                {isAlreadyValidated ? (
                  <View
                    style={[
                      styles.validationStatus,
                      catch_.validation?.status === 'approved'
                        ? styles.validationApproved
                        : styles.validationRejected,
                    ]}
                  >
                    <Text style={styles.validationStatusText}>
                      {catch_.validation?.status === 'approved' ? '✓ Godkendt' : '✗ Afvist'}
                    </Text>
                    {catch_.validation?.reason && (
                      <Text style={styles.validationReason}>{catch_.validation.reason}</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.validationButtons}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => openValidationModal(catch_, 'reject')}
                    >
                      <Text style={styles.rejectButtonText}>✗ Afvis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => openValidationModal(catch_, 'approve')}
                    >
                      <Text style={styles.approveButtonText}>✓ Godkend</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Validation Modal */}
      <Modal visible={!!validationMode} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {validationMode === 'approve' ? 'Godkend Fangst' : 'Afvis Fangst'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedCatch?.user.name} - {selectedCatch?.species}
            </Text>

            {validationMode === 'reject' && (
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalLabel}>Begrundelse (påkrævet):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="F.eks. GPS-koordinater matcher ikke EXIF-data"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeValidationModal}
                disabled={submitting}
              >
                <Text style={styles.modalCancelButtonText}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  validationMode === 'reject' && styles.modalRejectButton,
                ]}
                onPress={confirmValidation}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>
                    {validationMode === 'approve' ? 'Godkend' : 'Afvis'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
