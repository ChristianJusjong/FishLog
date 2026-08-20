import React, { useState, useEffect, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { useTheme } from '../contexts/ThemeContext';
import { useOnboardingJourney } from '../contexts/OnboardingJourneyContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { extractCatchMetadataFromImage } from '../lib/exifExtractor';
import { compressCatchPhoto } from '../lib/imageCompressor';
import { LoadingBar } from '../components/LoadingBar';
import ScreenLoading from '../components/ScreenLoading';
import SpeciesUnlockModal from '../components/SpeciesUnlockModal';
import VoiceCatchModal from '../components/VoiceCatchModal';
import FishSpeciesIcon from '../components/FishSpeciesIcon';
import { ParsedVoiceCatch } from '../lib/voiceCatchParser';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import {
  findNearestFishingLocation,
  getSpeciesName,
  getWaterTypeLabel,
  getWaterTypeColor,
  type FishingLocation,
} from '../data/fishingLocations';
import {
  LURE_TYPES,
  BAIT_TYPES,
  TECHNIQUES,
  getSmartGearSuggestions,
  type LureType,
  type BaitType,
  type TechniqueType,
} from '../data/fishingGear';
import { checkCatchRegulation, type RegulationCheckResult } from '../data/fishingRegulations';
import { API_URL } from '../config/api';

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
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.glow,
    },
    completeButtonGradient: {
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationInfoCard: {
      backgroundColor: colors.surface,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      borderLeftWidth: 4,
      ...SHADOWS.sm,
    },
    locationInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    locationInfoTitle: {
      ...TYPOGRAPHY.styles.body,
      fontWeight: '700',
      marginLeft: SPACING.xs,
      flex: 1,
    },
    locationInfoDistance: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
    },
    locationInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    locationInfoLabel: {
      ...TYPOGRAPHY.styles.small,
      color: colors.textSecondary,
      marginRight: SPACING.xs,
    },
    locationInfoValue: {
      ...TYPOGRAPHY.styles.small,
      fontWeight: '600',
    },
    speciesChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    speciesChip: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    speciesChipText: {
      ...TYPOGRAPHY.styles.small,
      color: colors.primary,
      fontWeight: '600',
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
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams();
  const { catchId, isNew } = params;
  const { completeMilestone } = useOnboardingJourney();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catch_, setCatch] = useState<any>(null);
  const [identifyingSpecies, setIdentifyingSpecies] = useState(false);
  const [unlockInfo, setUnlockInfo] = useState<{ species: string; rarity?: string; xp?: number } | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Form state - prefilled with params if available
  const [species, setSpecies] = useState(typeof params.species === 'string' ? params.species : '');
  const [lengthCm, setLengthCm] = useState(typeof params.length === 'string' ? params.length : '');
  const [weightKg, setWeightKg] = useState(typeof params.weight === 'string' ? params.weight : '');
  const [waterTemp, setWaterTemp] = useState('');
  const [bait, setBait] = useState(typeof params.bait === 'string' ? params.bait : '');
  const [lure, setLure] = useState('');
  const [rig, setRig] = useState('');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState(typeof params.notes === 'string' ? params.notes : '');
  const [visibility, setVisibility] = useState('private');
  const [released, setReleased] = useState(params.released === 'false' ? false : true); // Default to Catch & Release
  const [showAdvanced, setShowAdvanced] = useState(false);

  const POPULAR_BEGINNER_SPECIES = [
    { id: 'havorred', name: 'Havørred' },
    { id: 'aborre', name: 'Aborre' },
    { id: 'gedde', name: 'Gedde' },
    { id: 'sandart', name: 'Sandart' },
    { id: 'hornfisk', name: 'Hornfisk' },
    { id: 'skalle', name: 'Skalle' },
    { id: 'torsk', name: 'Torsk' },
    { id: 'makrel', name: 'Makrel' },
  ];

  // Auto-save draft whenever form fields change
  useEffect(() => {
    if (isNew === 'true' && (species || lengthCm || weightKg || notes || bait || lure)) {
      const draftData = {
        species,
        lengthCm,
        weightKg,
        waterTemp,
        bait,
        lure,
        rig,
        technique,
        notes,
        visibility,
        released,
        photoUrl: catch_?.photoUrl,
        timestamp: Date.now(),
      };
      AsyncStorage.setItem('@hook_catch_draft', JSON.stringify(draftData)).catch(() => {});
    }
  }, [species, lengthCm, weightKg, waterTemp, bait, lure, rig, technique, notes, visibility, released, catch_?.photoUrl, isNew]);

  // Check for existing draft on mount if form opened blank
  useEffect(() => {
    if (isNew === 'true' && !params.species && !params.length && !params.notes) {
      AsyncStorage.getItem('@hook_catch_draft').then(draftJson => {
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson);
            if (draft && Date.now() - (draft.timestamp || 0) < 24 * 60 * 60 * 1000) {
              Alert.alert(
                'Gendan kladde?',
                `Du har en igangværende fangstkladde (${draft.species || 'Ikke navngivet'}). Vil du gendanne den?`,
                [
                  {
                    text: 'Gendan',
                    onPress: () => {
                      if (draft.species) setSpecies(draft.species);
                      if (draft.lengthCm) setLengthCm(draft.lengthCm);
                      if (draft.weightKg) setWeightKg(draft.weightKg);
                      if (draft.waterTemp) setWaterTemp(draft.waterTemp);
                      if (draft.bait) setBait(draft.bait);
                      if (draft.lure) setLure(draft.lure);
                      if (draft.rig) setRig(draft.rig);
                      if (draft.technique) setTechnique(draft.technique);
                      if (draft.notes) setNotes(draft.notes);
                      if (draft.visibility) setVisibility(draft.visibility);
                      if (draft.released !== undefined) setReleased(draft.released);
                      if (draft.photoUrl) setCatch((prev: any) => ({ ...(prev || {}), photoUrl: draft.photoUrl }));
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    },
                  },
                  {
                    text: 'Slet kladde',
                    style: 'destructive',
                    onPress: () => {
                      AsyncStorage.removeItem('@hook_catch_draft').catch(() => {});
                    },
                  },
                ]
              );
            }
          } catch {}
        }
      });
    }
  }, [isNew]);

  const handleApplyVoiceCatch = (data: ParsedVoiceCatch) => {
    if (data.species) setSpecies(data.species);
    if (data.lengthCm) setLengthCm(String(data.lengthCm));
    if (data.weightKg) setWeightKg(String(data.weightKg));
    if (data.bait) setBait(data.bait);
    if (data.released !== undefined) setReleased(data.released);
    if (data.notes) setNotes(prev => prev ? `${prev}\n${data.notes}` : data.notes || '');
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Kamera tilladelse', 'Giv venligst tilladelse til kameraet for at tage foto');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const compressed = await compressCatchPhoto(result.assets[0].uri);
        setCatch((prev: any) => ({ ...(prev || {}), photoUrl: compressed.uri }));
      }
    } catch {
      Alert.alert('Fejl', 'Kunne ikke åbne kamera');
    }
  };

  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Galleri tilladelse', 'Giv venligst tilladelse til billeder');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
        exif: true,
      });
      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const compressed = await compressCatchPhoto(result.assets[0].uri);
        setCatch((prev: any) => ({ ...(prev || {}), photoUrl: compressed.uri }));
        const meta = await extractCatchMetadataFromImage(result.assets[0]);
        if (meta.latitude && meta.longitude) {
          setCatch((prev: any) => ({ ...prev, latitude: meta.latitude, longitude: meta.longitude }));
        }
      }
    } catch {
      Alert.alert('Fejl', 'Kunne ikke hente billede');
    }
  };

  // Danish fishing regulations check
  const regulationCheck = useMemo(() => {
    if (!species) return null;
    return checkCatchRegulation(species, lengthCm);
  }, [species, lengthCm]);

  // Find nearest known fishing location based on catch coordinates
  const nearestLocation = useMemo(() => {
    if (!catch_?.latitude || !catch_?.longitude) return null;
    return findNearestFishingLocation(catch_.latitude, catch_.longitude, 25); // Within 25km
  }, [catch_?.latitude, catch_?.longitude]);

  // Get species ID for gear suggestions (normalize Danish species name to ID)
  const speciesId = useMemo(() => {
    if (!species) return undefined;
    // Map common species names to IDs
    const speciesMap: Record<string, string> = {
      'Aborre': 'aborre',
      'Gedde': 'gedde',
      'Sandart': 'sandart',
      'Havørred': 'havorred',
      'Laks': 'laks',
      'Torsk': 'torsk',
      'Skalle': 'skalle',
      'Karpe': 'karpe',
      'Hornfisk': 'hornfisk',
      'Makrel': 'makrel',
      'Regnbueørred': 'regnbueorred',
      'Brasen': 'brasen',
      'Ål': 'al',
      'Stalling': 'stalling',
      'Bækørred': 'bakorred',
      'Suder': 'suder',
      'Sej/mørksej': 'sej',
      'Havbars': 'havbars',
    };
    return speciesMap[species] || species.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a');
  }, [species]);

  // Get smart gear suggestions based on selected species
  const gearSuggestions = useMemo(() => {
    return getSmartGearSuggestions(speciesId);
  }, [speciesId]);

  // Combine all gear options with suggestions at top
  const lureOptions = useMemo(() => {
    const suggested = gearSuggestions.lures;
    const suggestedIds = new Set(suggested.map(l => l.id));
    const others = LURE_TYPES.filter(l => !suggestedIds.has(l.id)).sort((a, b) => a.nameDa.localeCompare(b.nameDa, 'da'));
    return { suggested, others };
  }, [gearSuggestions.lures]);

  const baitOptions = useMemo(() => {
    const suggested = gearSuggestions.baits;
    const suggestedIds = new Set(suggested.map(b => b.id));
    const others = BAIT_TYPES.filter(b => !suggestedIds.has(b.id)).sort((a, b) => a.nameDa.localeCompare(b.nameDa, 'da'));
    return { suggested, others };
  }, [gearSuggestions.baits]);

  const techniqueOptions = useMemo(() => {
    const suggested = gearSuggestions.techniques;
    const suggestedIds = new Set(suggested.map(t => t.id));
    const others = TECHNIQUES.filter(t => !suggestedIds.has(t.id)).sort((a, b) => a.nameDa.localeCompare(b.nameDa, 'da'));
    return { suggested, others };
  }, [gearSuggestions.techniques]);

  useEffect(() => {
    if (catchId) {
      fetchCatch();
    }
  }, [catchId]);

  const fetchCatch = async () => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
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
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);

      const updateData = {
        species: species || undefined,
        lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        waterTemp: waterTemp ? parseFloat(waterTemp) : undefined,
        bait: bait || undefined,
        lure: lure || undefined,
        rig: rig || undefined,
        technique: technique || undefined,
        notes: notes || undefined,
        visibility,
        released,
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
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
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
            'AI Genkendelse',
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
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);

      // First update all data
      const updateData = {
        species,
        lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        waterTemp: waterTemp ? parseFloat(waterTemp) : undefined,
        bait: bait || undefined,
        lure: lure || undefined,
        rig: rig || undefined,
        technique: technique || undefined,
        notes: notes || undefined,
        visibility,
        released,
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
        AsyncStorage.removeItem('@hook_catch_draft').catch(() => {});
        
        // Trigger Journey Milestones
        completeMilestone('log_first_catch');
        completeMilestone('catch_two_fish');
        const hour = new Date().getHours();
        if (hour < 7) {
          completeMilestone('sunrise_fishing');
        }

        const result = await completeResponse.json();

        if (result.fiskedexUnlock || result.isFirstOfSpecies) {
          setUnlockInfo({
            species: result.fiskedexUnlock?.species || species,
            rarity: result.fiskedexUnlock?.rarity || 'Ny Art Oplåst',
            xp: result.xp?.earnedXP || 150,
          });
          return;
        }

        if (result.badges && result.badges.length > 0) {
          Alert.alert(
            'Fangst gemt!',
            `Du har optjent ${result.badges.length} ny${result.badges.length > 1 ? 'e' : ''} badge${result.badges.length > 1 ? 's' : ''}!`,
            [{ text: 'Fedt!', onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            '🎉 Fangst Logget & Verificeret!',
            `Flot fangst af ${species || 'fisk'}! Du har optjent +150 XP mod din næste rang i Hook.`,
            [
              {
                text: '👑 Vis Fangstkort / Story',
                onPress: () => {
                  if (catchId) {
                    router.replace(`/catch-detail?id=${catchId}`);
                  } else {
                    router.back();
                  }
                },
              },
              {
                text: 'Tilbage til Feed',
                style: 'cancel',
                onPress: () => router.back(),
              },
            ]
          );
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark || '#D4880F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="fish" size={40} color={colors.primary} />
          </LinearGradient>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: SPACING.lg }} />
          <Text style={styles.loadingText}>Indlæser fangst...</Text>
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

        {/* Photo section */}
        {catch_?.photoUrl ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: catch_.photoUrl }} style={styles.photo} resizeMode="cover" />
            <TouchableOpacity
              style={styles.lockedBadge}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={14} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.lockedText}>Skift foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: SPACING.md,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#00D4B2',
                borderRadius: 14,
                paddingVertical: 14,
                gap: 8,
              }}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={22} color="#00D4B2" />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Tag Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.accent,
                borderRadius: 14,
                paddingVertical: 14,
                gap: 8,
              }}
              onPress={handlePickGallery}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={22} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Fra Galleri</Text>
            </TouchableOpacity>
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

        {/* Nearest known fishing location info */}
        {nearestLocation && (
          <View style={[styles.locationInfoCard, { borderLeftColor: getWaterTypeColor(nearestLocation.location.waterType) }]}>
            <View style={styles.locationInfoHeader}>
              <Ionicons name="compass" size={20} color={getWaterTypeColor(nearestLocation.location.waterType)} />
              <Text style={[styles.locationInfoTitle, { color: colors.text }]}>
                {nearestLocation.location.name}
              </Text>
              <Text style={styles.locationInfoDistance}>
                {nearestLocation.distance.toFixed(1)} km væk
              </Text>
            </View>

            <View style={styles.locationInfoRow}>
              <Text style={styles.locationInfoLabel}>Vandtype:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getWaterTypeColor(nearestLocation.location.waterType), marginRight: 4 }} />
                <Text style={[styles.locationInfoValue, { color: colors.text }]}>
                  {getWaterTypeLabel(nearestLocation.location.waterType)}
                </Text>
              </View>
            </View>

            {nearestLocation.location.depth && (
              <View style={styles.locationInfoRow}>
                <Text style={styles.locationInfoLabel}>Dybde:</Text>
                <Text style={[styles.locationInfoValue, { color: colors.text }]}>{nearestLocation.location.depth}</Text>
              </View>
            )}

            {nearestLocation.location.regulations && (
              <View style={styles.locationInfoRow}>
                <Ionicons name="alert-circle" size={14} color={colors.warning} style={{ marginRight: 4 }} />
                <Text style={[styles.locationInfoValue, { color: colors.warning }]}>
                  {nearestLocation.location.regulations}
                </Text>
              </View>
            )}

            <Text style={[styles.locationInfoLabel, { marginTop: SPACING.xs, marginBottom: 4 }]}>
              Almindelige arter her (tryk for at vælge):
            </Text>
            <View style={styles.speciesChipsContainer}>
              {nearestLocation.location.species.slice(0, 6).map((speciesId) => (
                <TouchableOpacity
                  key={speciesId}
                  style={[
                    styles.speciesChip,
                    species === getSpeciesName(speciesId) && { backgroundColor: colors.accent, borderColor: '#FFD93D' }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSpecies(getSpeciesName(speciesId));
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.speciesChipText,
                    species === getSpeciesName(speciesId) && { color: '#FFFFFF', fontWeight: '700' }
                  ]}>
                    {getSpeciesName(speciesId)}
                  </Text>
                </TouchableOpacity>
              ))}
              {nearestLocation.location.species.length > 6 && (
                <View style={[styles.speciesChip, { backgroundColor: colors.border }]}>
                  <Text style={[styles.speciesChipText, { color: colors.textSecondary }]}>
                    +{nearestLocation.location.species.length - 6}
                  </Text>
                </View>
              )}
            </View>

            {/* Auto-Snap Apply Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 212, 178, 0.15)',
                borderWidth: 1,
                borderColor: '#00D4B2',
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginTop: 10,
                gap: 6,
              }}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                setNotes(prev => prev ? `${prev}\nFisket ved ${nearestLocation.location.name} (${nearestLocation.location.waterType})` : `Fisket ved ${nearestLocation.location.name} (${nearestLocation.location.waterType})`);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={16} color="#00D4B2" />
              <Text style={{ color: '#00D4B2', fontWeight: '700', fontSize: 12 }}>
                Anvend {nearestLocation.location.name} i noter
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Species picker */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fish" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Art *</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.secondary }]}
                onPress={() => setShowVoiceModal(true)}
              >
                <Ionicons name="mic" size={16} color={colors.white} />
                <Text style={styles.aiButtonText}>Tale-Log</Text>
              </TouchableOpacity>
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
          </View>

          {identifyingSpecies && (
            <View style={{ marginBottom: 10 }}>
              <LoadingBar
                height={3}
                glow={true}
                colors={['#00D4B2', '#FFB800', '#F97316']}
                label="Google Gemini scanner fangstfoto for fiskeart..."
              />
            </View>
          )}

          {/* Quick Beginner Species Selector */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 }}>
            Hurtig-vælger (populære danske arter):
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
            {POPULAR_BEGINNER_SPECIES.map((sp) => {
              const isSelected = species.toLowerCase() === sp.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={sp.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: isSelected ? 'rgba(0, 212, 178, 0.18)' : colors.surface,
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#00D4B2' : colors.border,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSpecies(sp.name);
                  }}
                  activeOpacity={0.75}
                >
                  <FishSpeciesIcon speciesId={sp.id} size={20} color={isSelected ? '#00D4B2' : colors.textSecondary} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#00D4B2' : colors.text,
                  }}>
                    {sp.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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

        {/* Length, Weight and Water Temp */}
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

        {/* Mindstemål & Fredningsvogter Badge & Notice */}
        {regulationCheck && (
          <View style={{
            backgroundColor:
              regulationCheck.badgeType === 'warning_undersize' ? '#FFFBEB' :
              regulationCheck.badgeType === 'warning_closed_season' ? '#FEF2F2' :
              regulationCheck.badgeType === 'protected' ? '#FEF2F2' : '#F0FDF4',
            borderWidth: 1,
            borderColor:
              regulationCheck.badgeType === 'warning_undersize' ? '#F59E0B' :
              regulationCheck.badgeType === 'warning_closed_season' ? '#EF4444' :
              regulationCheck.badgeType === 'protected' ? '#EF4444' : '#10B981',
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            marginBottom: SPACING.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons
                  name={
                    regulationCheck.badgeType === 'legal' ? 'shield-checkmark' :
                    regulationCheck.badgeType === 'protected' ? 'close-circle' : 'warning'
                  }
                  size={18}
                  color={
                    regulationCheck.badgeType === 'warning_undersize' ? '#D97706' :
                    regulationCheck.badgeType === 'warning_closed_season' ? '#DC2626' :
                    regulationCheck.badgeType === 'protected' ? '#DC2626' : '#059669'
                  }
                />
                <Text style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color:
                    regulationCheck.badgeType === 'warning_undersize' ? '#92400E' :
                    regulationCheck.badgeType === 'warning_closed_season' ? '#991B1B' :
                    regulationCheck.badgeType === 'protected' ? '#991B1B' : '#065F46',
                }}>
                  Fiskeristyrelsen Mindstemål & Fredning
                </Text>
              </View>
              {regulationCheck.minimumSizeCm && (
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>
                  Min. {regulationCheck.minimumSizeCm} cm
                </Text>
              )}
            </View>
            <Text style={{
              fontSize: 12,
              color: colors.text,
              lineHeight: 16,
            }}>
              {regulationCheck.message}
            </Text>

            {/* Catch & Release Selector */}
            <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setReleased(true)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: RADIUS.md,
                  backgroundColor: released ? '#10B981' : colors.surface,
                  borderWidth: 1,
                  borderColor: released ? '#10B981' : colors.border,
                }}
              >
                <Ionicons name="repeat" size={16} color={released ? '#FFFFFF' : colors.textSecondary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: released ? '#FFFFFF' : colors.text }}>
                  Genudsat (C&R)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setReleased(false)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: RADIUS.md,
                  backgroundColor: !released ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: !released ? colors.primary : colors.border,
                }}
              >
                <Ionicons name="basket" size={16} color={!released ? '#FFFFFF' : colors.textSecondary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: !released ? '#FFFFFF' : colors.text }}>
                  Hjemtaget
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bait (Agn) Picker */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bug" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Agn</Text>
            </View>
            {speciesId && baitOptions.suggested.length > 0 && (
              <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.success }}>
                {baitOptions.suggested.length} anbefalinger
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>
            Hvad bed fisken på? (F.eks. regnorm, majs, brød, flue eller blink)
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bait}
              onValueChange={(value) => setBait(value)}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Vælg agn..." value="" color={colors.textSecondary} />
              {speciesId && baitOptions.suggested.length > 0 && (
                <Picker.Item label="── Anbefalet ──" value="" enabled={false} color={colors.success} />
              )}
              {baitOptions.suggested.map((b) => (
                <Picker.Item key={b.id} label={`★ ${b.nameDa}`} value={b.nameDa} />
              ))}
              {baitOptions.others.length > 0 && (
                <Picker.Item label="── Alle agn ──" value="" enabled={false} color={colors.textSecondary} />
              )}
              {baitOptions.others.map((b) => (
                <Picker.Item key={b.id} label={b.nameDa} value={b.nameDa} />
              ))}
              <Picker.Item label="── Andet ──" value="" enabled={false} color={colors.textSecondary} />
              <Picker.Item label="Andet (skriv i noter)" value="Andet" />
            </Picker>
          </View>
        </View>

        {/* Lure (Wobler/Spin) Picker */}
        <View style={styles.fieldGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fish-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.label}>Endegrej (Blink, Spinner, Flue)</Text>
            </View>
            {speciesId && lureOptions.suggested.length > 0 && (
              <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.success }}>
                {lureOptions.suggested.length} anbefalinger
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>
            Type af kunstagn (F.eks. gennemløber, spinner, softbait eller flue)
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={lure}
              onValueChange={(value) => setLure(value)}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Vælg endegrej..." value="" color={colors.textSecondary} />
              {speciesId && lureOptions.suggested.length > 0 && (
                <Picker.Item label="── Anbefalet ──" value="" enabled={false} color={colors.success} />
              )}
              {lureOptions.suggested.map((l) => (
                <Picker.Item key={l.id} label={`★ ${l.nameDa}`} value={l.nameDa} />
              ))}
              {lureOptions.others.length > 0 && (
                <Picker.Item label="── Alle kunstagn ──" value="" enabled={false} color={colors.textSecondary} />
              )}
              {lureOptions.others.map((l) => (
                <Picker.Item key={l.id} label={l.nameDa} value={l.nameDa} />
              ))}
              <Picker.Item label="── Andet ──" value="" enabled={false} color={colors.textSecondary} />
              <Picker.Item label="Andet (skriv i noter)" value="Andet" />
            </Picker>
          </View>
        </View>

        {/* Collapsible Advanced Section for Beginners vs Pros */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
            padding: 14,
            borderRadius: 14,
            marginVertical: 10,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setShowAdvanced(!showAdvanced);
          }}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={showAdvanced ? 'options' : 'options-outline'} size={18} color="#00D4B2" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
              {showAdvanced ? 'Skjul avancerede felter' : 'Avancerede fiskedata (valgfrit)'}
            </Text>
          </View>
          <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {showAdvanced && (
          <View style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0',
          }}>
            {/* Water Temperature & Automated AI Telemetry */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="water-outline" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.label}>Vandtemperatur (°C)</Text>
                </View>
                <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.secondary }}>
                  Valgfri
                </Text>
              </View>
              <TextInput
                style={styles.input}
                value={waterTemp}
                onChangeText={setWaterTemp}
                placeholder="f.eks. 12.5"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Rig (Forfang/Grej) */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="construct" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.label}>Forfang / Linemontage</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>
                F.eks. flåd/prop, bundsnøre, bombarda eller alm. spinnestang
              </Text>
              <TextInput
                style={styles.input}
                value={rig}
                onChangeText={setRig}
                placeholder="f.eks. Flåd med regnorm, 2m dybde"
              />
            </View>

            {/* Technique Picker */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flag" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.label}>Fisketeknik</Text>
                </View>
                {speciesId && techniqueOptions.suggested.length > 0 && (
                  <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.success }}>
                    {techniqueOptions.suggested.length} anbefalinger
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>
                F.eks. spinnefiskeri, medefiskeri, fluefiskeri eller dørgefiskeri
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={technique}
                  onValueChange={(value) => setTechnique(value)}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item label="Vælg teknik..." value="" color={colors.textSecondary} />
                  {speciesId && techniqueOptions.suggested.length > 0 && (
                    <Picker.Item label="── Anbefalet ──" value="" enabled={false} color={colors.success} />
                  )}
                  {techniqueOptions.suggested.map((t) => (
                    <Picker.Item key={t.id} label={`★ ${t.nameDa}`} value={t.nameDa} />
                  ))}
                  {techniqueOptions.others.length > 0 && (
                    <Picker.Item label="── Alle teknikker ──" value="" enabled={false} color={colors.textSecondary} />
                  )}
                  {techniqueOptions.others.map((t) => (
                    <Picker.Item key={t.id} label={t.nameDa} value={t.nameDa} />
                  ))}
                  <Picker.Item label="── Andet ──" value="" enabled={false} color={colors.textSecondary} />
                  <Picker.Item label="Andet (skriv i noter)" value="Andet" />
                </Picker>
              </View>
            </View>
          </View>
        )}

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
            style={[styles.button, { overflow: 'hidden', ...SHADOWS.glow }]}
            onPress={completeCatch}
            disabled={saving || !species}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark || '#D4880F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completeButtonGradient}
            >
              {saving ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.buttonText, { color: colors.primary }]}>Færdiggør fangst</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Annuller</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Celebratory Species Unlock Modal */}
      <SpeciesUnlockModal
        visible={!!unlockInfo}
        speciesName={unlockInfo?.species || ''}
        rarity={unlockInfo?.rarity}
        xpEarned={unlockInfo?.xp}
        onClose={() => {
          setUnlockInfo(null);
          router.back();
        }}
      />

      {/* Voice Catch Modal */}
      <VoiceCatchModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApplyParsedData={handleApplyVoiceCatch}
      />
    </SafeAreaView>
  );
}