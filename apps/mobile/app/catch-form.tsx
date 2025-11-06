import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

const FISH_SPECIES = [
  'Gedde', 'Aborre', 'Sandart', 'Ørred', 'Karpe',
  'Brasen', 'Helt', 'Havørred', 'Torsk', 'Makrel'
];

export default function CatchFormScreen() {
  const router = useRouter();
  const { catchId, isNew } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catch_, setCatch] = useState<any>(null);

  // Form state
  const [species, setSpecies] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bait, setBait] = useState('');
  const [lure, setLure] = useState('');
  const [rig, setRig] = useState('');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState('private');

  useEffect(() => {
    if (catchId) {
      fetchCatch();
    }
  }, [catchId]);

  const fetchCatch = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatch(data);

        // Populate form with existing data
        setSpecies(data.species || '');
        setLengthCm(data.lengthCm?.toString() || '');
        setWeightKg(data.weightKg?.toString() || '');
        setBait(data.bait || '');
        setLure(data.lure || '');
        setRig(data.rig || '');
        setTechnique(data.technique || '');
        setNotes(data.notes || '');
        setVisibility(data.visibility || 'private');
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente fangst');
        router.back();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Fejl', 'Kunne ikke hente fangst');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const updateData = {
        species: species || undefined,
        lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        bait: bait || undefined,
        lure: lure || undefined,
        rig: rig || undefined,
        technique: technique || undefined,
        notes: notes || undefined,
        visibility,
      };

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        Alert.alert('Gemt!', 'Fangst gemt som kladde');
        router.back();
      } else {
        Alert.alert('Fejl', 'Kunne ikke gemme fangst');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Fejl', 'Kunne ikke gemme fangst');
    } finally {
      setSaving(false);
    }
  };

  const completeCatch = async () => {
    if (!species.trim()) {
      Alert.alert('Mangler art', 'Du skal vælge en art for at færdiggøre fangsten');
      return;
    }

    setSaving(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // First update all data
      const updateData = {
        species,
        lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        bait: bait || undefined,
        lure: lure || undefined,
        rig: rig || undefined,
        technique: technique || undefined,
        notes: notes || undefined,
        visibility,
      };

      const updateResponse = await fetch(`${API_URL}/catches/${catchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update catch');
      }

      // Then mark as complete
      const completeResponse = await fetch(`${API_URL}/catches/${catchId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (completeResponse.ok) {
        const result = await completeResponse.json();

        if (result.badges && result.badges.length > 0) {
          Alert.alert(
            '🎉 Fangst færdiggjort!',
            `Du har optjent ${result.badges.length} ny${result.badges.length > 1 ? 'e' : ''} badge${result.badges.length > 1 ? 's' : ''}!`,
            [{ text: 'Fedt!', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Succes!', 'Fangst færdiggjort');
          router.back();
        }
      } else {
        Alert.alert('Fejl', 'Kunne ikke færdiggøre fangst');
      }
    } catch (error) {
      console.error('Complete error:', error);
      Alert.alert('Fejl', 'Kunne ikke færdiggøre fangst');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Indlæser...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isNew === 'true' ? '📝 Udfyld fangstdata' : '✏️ Rediger fangst'}
        </Text>

        {/* Locked photo preview */}
        {catch_?.photoUrl && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: catch_.photoUrl }} style={styles.photo} resizeMode="cover" />
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>🔒 Billede låst</Text>
            </View>
          </View>
        )}

        {/* GPS coordinates (locked) */}
        {catch_?.latitude && catch_?.longitude && (
          <View style={styles.gpsContainer}>
            <Text style={styles.gpsLabel}>📍 GPS-koordinater (låst):</Text>
            <Text style={styles.gpsText}>
              {catch_.latitude.toFixed(6)}, {catch_.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Species picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🐟 Art *</Text>
          <View style={styles.speciesGrid}>
            {FISH_SPECIES.map((fish) => (
              <TouchableOpacity
                key={fish}
                style={[
                  styles.speciesChip,
                  species === fish && styles.speciesChipActive
                ]}
                onPress={() => setSpecies(fish)}
              >
                <Text style={[
                  styles.speciesChipText,
                  species === fish && styles.speciesChipTextActive
                ]}>
                  {fish}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Length and Weight */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>📏 Længde (cm)</Text>
            <TextInput
              style={styles.input}
              value={lengthCm}
              onChangeText={setLengthCm}
              placeholder="f.eks. 45"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>⚖️ Vægt (kg)</Text>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="f.eks. 1.5"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Bait and Lure */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🪱 Agn</Text>
          <TextInput
            style={styles.input}
            value={bait}
            onChangeText={setBait}
            placeholder="f.eks. orm, majs"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🎣 Wobler/Spin</Text>
          <TextInput
            style={styles.input}
            value={lure}
            onChangeText={setLure}
            placeholder="f.eks. Rapala"
          />
        </View>

        {/* Rig and Technique */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🔧 Grej</Text>
          <TextInput
            style={styles.input}
            value={rig}
            onChangeText={setRig}
            placeholder="f.eks. kastestang 2.7m"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🎯 Teknik</Text>
          <TextInput
            style={styles.input}
            value={technique}
            onChangeText={setTechnique}
            placeholder="f.eks. spinning, bundfi skeri"
          />
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>📝 Noter</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Skriv noter om fangsten..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Visibility */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>👁️ Synlighed</Text>
          <View style={styles.visibilityRow}>
            {['private', 'friends', 'public'].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.visibilityButton,
                  visibility === v && styles.visibilityButtonActive
                ]}
                onPress={() => setVisibility(v)}
              >
                <Text style={[
                  styles.visibilityText,
                  visibility === v && styles.visibilityTextActive
                ]}>
                  {v === 'private' ? 'Privat' : v === 'friends' ? 'Venner' : 'Offentlig'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={saveDraft}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>💾 Gem som kladde</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={completeCatch}
            disabled={saving || !species}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>✅ Færdiggør fangst</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Annuller</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  photo: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.border,
  },
  lockedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  lockedText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.white,
  },
  gpsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  gpsLabel: {
    ...TYPOGRAPHY.styles.small,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  gpsText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.styles.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...TYPOGRAPHY.styles.body,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  speciesChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  speciesChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  speciesChipText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.text,
  },
  speciesChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfField: {
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  visibilityButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  visibilityText: {
    ...TYPOGRAPHY.styles.small,
    color: COLORS.text,
  },
  visibilityTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  draftButton: {
    backgroundColor: COLORS.secondary,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.white,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  cancelText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
