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
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
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
      backgroundColor: colors.border,
    },
    lockedBadge: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    lockedText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.white,
    },
    gpsContainer: {
      backgroundColor: colors.surface,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
      borderLeftWidth: 3,
      borderLeftColor: colors.secondary,
    },
    gpsLabel: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
      marginBottom: SPACING.xs,
    },
    gpsText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      ...TYPOGRAPHY.styles.body,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      overflow: 'hidden',
    },
    picker: {
      ...TYPOGRAPHY.styles.body,
      color: colors.text,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.accent,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
      ...SHADOWS.sm,
    },
    aiButtonText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.white,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.sm,
      alignItems: 'center',
    },
    visibilityButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    visibilityText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.text,
    },
    visibilityTextActive: {
      color: colors.white,
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
      backgroundColor: colors.secondary,
    },
    completeButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.white,
    },
    cancelButton: {
      paddingVertical: SPACING.sm,
      alignItems: 'center',
      marginTop: SPACING.md,
    },
    cancelText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
  });
};

const FISH_SPECIES = [
  'Aborre', 'Adriatisk stør', 'Almindelig tangnål', 'Ansjos', 'Atlantisk tun',
  'Belugastør', 'Berggylt', 'Bitterling', 'Blåstak/rødnæb', 'Brasen',
  'Brisling', 'Bæklampret', 'Bækørred', 'Båndgrundling', 'Diamantstør',
  'Dværgmalle', 'Elritse', 'Femtrådet havkvabbe', 'Finnestribet ferskvandsulk', 'Firtrådet havkvabbe',
  'Fjæsing', 'Flire', 'Gedde', 'Glaskutling', 'Glastunge',
  'Glatstør', 'Glyse', 'Grundling', 'Græskarpe', 'Grå knurhane',
  'Gråhaj', 'Guldfisk/sølvkarusse', 'Guldmulte', 'Guldørred', 'Havbars',
  'Havkarusse', 'Havkat', 'Havørred', 'Helt', 'Heltling',
  'Hestemakrel', 'Hork', 'Hornfisk', 'Hvid stør', 'Hvidfinnet ferskvandsulk',
  'Hvilling', 'Hvilugastør', 'Håising', 'Hårhvarre', 'Ising',
  'Karusse', 'Kildeørred', 'Knude', 'Kortfinnet fløjfisk', 'Kortsnudet stør',
  'Krystalkutling', 'Kuller', 'Kulmule', 'Laks', 'Lange',
  'Langtornet ulk', 'Lerkutling', 'Lille fjæsing', 'Lille hundefisk', 'Lille tangnål',
  'Lubbe/lyssej', 'Løje', 'Makrel', 'Malle', 'Multe',
  'Nipigget hundestejle', 'Næse', 'Panserulk', 'Pighaj', 'Pighvarre',
  'Pigsmerling', 'Regnbueørred', 'Regnløje', 'Rimte', 'Rudskalle',
  'Rød knurhane', 'Rødspætte', 'Rødtunge', 'Sandart', 'Sandkutling',
  'Sardin', 'Savgylte', 'Sej/mørksej', 'Sibirisk stør', 'Sild',
  'Skalle', 'Skrubbe', 'Skægtorsk', 'Skælkarpe', 'Slethvarre',
  'Slimål', 'Smelt', 'Smerling', 'Småmundet gylte', 'Småplettet rødhaj',
  'Snippe', 'Solaborre', 'Solskinsbars', 'Sorthaj', 'Sortkutling',
  'Sortmundet kutling', 'Sortvels', 'Spejlkarpe', 'Sperling', 'Spættet kutling',
  'Stalling', 'Stavsild', 'Stenbider', 'Sterlet', 'Stjernehus/stjernestør',
  'Stor næbsnog', 'Stor tangnål', 'Stribefisk', 'Stribet fløjfisk', 'Stribet havrude',
  'Stribet mulle', 'Strømskalle', 'Suder', 'Særfinnet ringbug', 'Sølvkarpe',
  'Sølvlaks', 'Sølvørred', 'Søørred', 'Tangkvabbe', 'Tangsnarre',
  'Tangspræl', 'Tigerørred', 'Tobis', 'Toplettet kutling', 'Torsk',
  'Trepigget hundestejle', 'Tun', 'Tunge/søtunge', 'Tungehvarre', 'Ulk',
  'Vestatlantisk stør', 'Ål', 'Ålekvabbe'
].sort();

export default function CatchFormScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const { catchId, isNew } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catch_, setCatch] = useState<any>(null);
  const [identifyingSpecies, setIdentifyingSpecies] = useState(false);

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

  const identifySpeciesWithAI = async () => {
    if (!catch_?.photoUrl) {
      Alert.alert('Ingen billede', 'Du skal have et billede for at bruge AI art-genkendelse');
      return;
    }

    setIdentifyingSpecies(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/ai/identify-species`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          imageUrl: catch_.photoUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.species && result.species !== 'Kunne ikke identificere') {
          setSpecies(result.species.replace('?', ''));
          const confidenceText = result.confidence === 'low'
            ? ' (AI er usikker - bekræft venligst arten)'
            : '';
          Alert.alert(
            '🤖 AI Genkendelse',
            `AI har identificeret arten som: ${result.species}${confidenceText}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Kunne ikke identificere',
            'AI kunne ikke identificere fiskeart. Prøv at vælge manuelt.',
            [{ text: 'OK' }]
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Kunne ikke bruge AI genkendelse';
        console.error('AI identification error response:', errorData);
        Alert.alert('Fejl', errorMessage);
      }
    } catch (error) {
      console.error('AI identification error:', error);
      Alert.alert('Fejl', `Kunne ikke bruge AI genkendelse: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
    } finally {
      setIdentifyingSpecies(false);
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
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Indlæser...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
          <Ionicons
            name={isNew === 'true' ? 'document-text' : 'create'}
            size={28}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.title}>
            {isNew === 'true' ? 'Udfyld fangstdata' : 'Rediger fangst'}
          </Text>
        </View>

        {/* Locked photo preview */}
        {catch_?.photoUrl && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: catch_.photoUrl }} style={styles.photo} resizeMode="cover" />
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.lockedText}>Billede låst</Text>
            </View>
          </View>
        )}

        {/* GPS coordinates (locked) */}
        {catch_?.latitude && catch_?.longitude && (
          <View style={styles.gpsContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Ionicons name="location" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.gpsLabel}>GPS-koordinater (låst):</Text>
            </View>
            <Text style={styles.gpsText}>
              {catch_.latitude.toFixed(6)}, {catch_.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Species picker */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fish" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Art *</Text>
            </View>
            {catch_?.photoUrl && (
              <TouchableOpacity
                style={styles.aiButton}
                onPress={identifySpeciesWithAI}
                disabled={identifyingSpecies}
              >
                {identifyingSpecies ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color={colors.white} />
                    <Text style={styles.aiButtonText}>AI Genkend</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={species}
              onValueChange={(value) => setSpecies(value)}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Vælg fiskeart..." value="" color={colors.textSecondary} />
              {FISH_SPECIES.map((fish) => (
                <Picker.Item key={fish} label={fish} value={fish} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Length and Weight */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="resize" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Længde (cm)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={lengthCm}
              onChangeText={setLengthCm}
              placeholder="f.eks. 45"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.halfField}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="scale-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Vægt (kg)</Text>
            </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bug" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Agn</Text>
          </View>
          <TextInput
            style={styles.input}
            value={bait}
            onChangeText={setBait}
            placeholder="f.eks. orm, majs"
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="fish-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Wobler/Spin</Text>
          </View>
          <TextInput
            style={styles.input}
            value={lure}
            onChangeText={setLure}
            placeholder="f.eks. Rapala"
          />
        </View>

        {/* Rig and Technique */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="construct" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Grej</Text>
          </View>
          <TextInput
            style={styles.input}
            value={rig}
            onChangeText={setRig}
            placeholder="f.eks. kastestang 2.7m"
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flag" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Teknik</Text>
          </View>
          <TextInput
            style={styles.input}
            value={technique}
            onChangeText={setTechnique}
            placeholder="f.eks. spinning, bundfi skeri"
          />
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="document-text" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Noter</Text>
          </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="eye" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.label}>Synlighed</Text>
          </View>
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
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="save" size={20} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Gem som kladde</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={completeCatch}
            disabled={saving || !species}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Færdiggør fangst</Text>
              </View>
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