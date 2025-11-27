import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
import { useTheme } from '../contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

const CONTEST_RULES = [
  { value: 'biggest_single', label: 'Største enkeltfisk' },
  { value: 'biggest_total', label: 'Samlet vægt' },
  { value: 'most_catches', label: 'Flest fangster' },
];

type ContestRule = 'biggest_single' | 'biggest_total' | 'most_catches';

type Contest = {
  rules: ContestRule[];
  speciesFilter: string;
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: SPACING.lg,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginTop: 40,
      marginBottom: SPACING.lg,
      textAlign: 'center',
      color: colors.text,
    },
    form: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.sm,
      marginTop: SPACING.md,
    },
    input: {
      width: '100%',
      padding: SPACING.lg,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    visibilityContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    visibilityOption: {
      flex: 1,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    visibilityOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    visibilityText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    visibilityTextSelected: {
      color: colors.primary,
    },
    contestsSection: {
      marginTop: SPACING.lg,
    },
    contestsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    addButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    contestCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    contestLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    removeButton: {
      padding: SPACING.xs,
    },
    contestFieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
      marginTop: SPACING.sm,
    },
    contestInput: {
      width: '100%',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.backgroundLight,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 14,
    },
    submitButton: {
      backgroundColor: colors.success,
      padding: SPACING.lg,
      borderRadius: RADIUS.md,
      marginTop: SPACING.xl,
      ...SHADOWS.sm,
    },
    cancelButton: {
      backgroundColor: colors.textSecondary,
      padding: SPACING.lg,
      borderRadius: RADIUS.md,
      marginTop: SPACING.md,
      ...SHADOWS.sm,
    },
    disabledButton: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    mapModal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mapHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      paddingTop: SPACING.xl + 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mapTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    mapCloseButton: {
      padding: SPACING.xs,
    },
    map: {
      flex: 1,
    },
    mapFooter: {
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mapHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    rulesContainer: {
      gap: SPACING.sm,
    },
    ruleCheckbox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: colors.backgroundLight,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: SPACING.sm,
    },
    ruleCheckboxSelected: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    ruleLabel: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    ruleLabelSelected: {
      fontWeight: '600',
      color: colors.primary,
    },
    mapButtonRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    mapActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      gap: SPACING.xs,
      ...SHADOWS.sm,
    },
    mapActionButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    mapUndoButton: {
      backgroundColor: colors.textSecondary,
    },
    mapClearButton: {
      backgroundColor: colors.error,
    },
    mapConfirmButton: {
      backgroundColor: colors.success,
    },
  });
};

export default function CreateEventScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date(Date.now() + 8 * 60 * 60 * 1000)); // 8 hours later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [areaCoordinates, setAreaCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('public');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);

  const addContest = () => {
    setContests([...contests, { rules: ['biggest_single'], speciesFilter: '' }]);
  };

  const removeContest = (index: number) => {
    setContests(contests.filter((_, i) => i !== index));
  };

  const toggleContestRule = (contestIndex: number, rule: ContestRule) => {
    const updated = [...contests];
    const contest = updated[contestIndex];
    if (contest.rules.includes(rule)) {
      contest.rules = contest.rules.filter(r => r !== rule);
    } else {
      contest.rules = [...contest.rules, rule];
    }
    setContests(updated);
  };

  const updateContestSpecies = (index: number, value: string) => {
    const updated = [...contests];
    updated[index].speciesFilter = value;
    setContests(updated);
  };

  const addAreaPoint = (coordinate: { latitude: number; longitude: number }) => {
    setAreaCoordinates([...areaCoordinates, coordinate]);
  };

  const undoLastPoint = () => {
    setAreaCoordinates(areaCoordinates.slice(0, -1));
  };

  const clearArea = () => {
    setAreaCoordinates([]);
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Fejl', 'Titel er påkrævet');
      return;
    }

    if (startAt >= endAt) {
      Alert.alert('Fejl', 'Starttidspunkt skal være før sluttidspunkt');
      return;
    }

    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Calculate center of area if coordinates exist
      const centerLat = areaCoordinates.length > 0
        ? areaCoordinates.reduce((sum, coord) => sum + coord.latitude, 0) / areaCoordinates.length
        : undefined;
      const centerLon = areaCoordinates.length > 0
        ? areaCoordinates.reduce((sum, coord) => sum + coord.longitude, 0) / areaCoordinates.length
        : undefined;

      const eventData = {
        title,
        description: description || undefined,
        venue: venue || undefined,
        latitude: centerLat,
        longitude: centerLon,
        areaCoordinates: areaCoordinates.length >= 3 ? areaCoordinates : undefined,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        visibility,
        contests: contests.map(c => ({
          rules: c.rules,
          speciesFilter: c.speciesFilter || undefined,
        })),
      };

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const event = await response.json();
        Alert.alert('Succes', 'Event oprettet!', [
          {
            text: 'OK',
            onPress: () => router.replace(`/event/${event.id}`),
          },
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke oprette event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Opret Event</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Titel *</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. Sommer Fiskeri Konkurrence 2024"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />

        <Text style={styles.label}>Beskrivelse</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beskriv eventet..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Sted</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. Silkeborg Søerne"
          value={venue}
          onChangeText={setVenue}
          editable={!loading}
        />

        <Text style={styles.label}>Område på kort</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
          disabled={loading}
        >
          <Ionicons name="map" size={20} color={colors.primary} />
          <Text style={styles.mapButtonText}>
            {areaCoordinates.length > 0
              ? `📍 ${areaCoordinates.length} punkter markeret`
              : 'Tegn område på kort (tryk for at tilføje punkter)'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Starttidspunkt *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
          disabled={loading}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.dateButtonText}>
            {startAt.toLocaleString('da-DK', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startAt}
            mode="datetime"
            display="default"
            onChange={(event: any, selectedDate: Date | undefined) => {
              setShowStartPicker(false);
              if (selectedDate) setStartAt(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Sluttidspunkt *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
          disabled={loading}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.dateButtonText}>
            {endAt.toLocaleString('da-DK', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endAt}
            mode="datetime"
            display="default"
            onChange={(event: any, selectedDate: Date | undefined) => {
              setShowEndPicker(false);
              if (selectedDate) setEndAt(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Synlighed *</Text>
        {Platform.OS === 'web' ? (
          <select
            value={visibility}
            onChange={(e: any) => setVisibility(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 16,
              border: '1px solid #ddd',
            }}
            disabled={loading}
          >
            <option value="public">Offentlig (alle kan se)</option>
            <option value="friends">Venner (kun dine venner)</option>
            <option value="private">Privat (kun dig)</option>
          </select>
        ) : (
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('public')}
              disabled={loading}
            >
              <Ionicons
                name="globe"
                size={18}
                color={visibility === 'public' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextSelected]}>
                Offentlig
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'friends' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('friends')}
              disabled={loading}
            >
              <Ionicons
                name="people"
                size={18}
                color={visibility === 'friends' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.visibilityText, visibility === 'friends' && styles.visibilityTextSelected]}>
                Venner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('private')}
              disabled={loading}
            >
              <Ionicons
                name="lock-closed"
                size={18}
                color={visibility === 'private' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextSelected]}>
                Privat
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contestsSection}>
          <View style={styles.contestsHeader}>
            <Text style={styles.label}>Konkurrencer (valgfrit)</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addContest}
              disabled={loading}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text style={styles.addButtonText}>Tilføj</Text>
            </TouchableOpacity>
          </View>

          {contests.map((contest, index) => (
            <View key={index} style={styles.contestCard}>
              <View style={styles.contestHeader}>
                <Text style={styles.contestLabel}>Konkurrence #{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeContest(index)}
                  disabled={loading}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.contestFieldLabel}>Regler (vælg én eller flere)</Text>
              <View style={styles.rulesContainer}>
                {CONTEST_RULES.map(rule => (
                  <TouchableOpacity
                    key={rule.value}
                    style={[
                      styles.ruleCheckbox,
                      contest.rules.includes(rule.value as ContestRule) && styles.ruleCheckboxSelected
                    ]}
                    onPress={() => toggleContestRule(index, rule.value as ContestRule)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={contest.rules.includes(rule.value as ContestRule) ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={contest.rules.includes(rule.value as ContestRule) ? colors.primary : colors.textTertiary}
                    />
                    <Text style={[
                      styles.ruleLabel,
                      contest.rules.includes(rule.value as ContestRule) && styles.ruleLabelSelected
                    ]}>
                      {rule.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.contestFieldLabel}>Fiskeart (valgfri)</Text>
              <TextInput
                style={styles.contestInput}
                placeholder="F.eks. Gedde (lad stå tom for alle)"
                value={contest.speciesFilter}
                onChangeText={(value) => updateContestSpecies(index, value)}
                editable={!loading}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Opret Event</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Annuller</Text>
        </TouchableOpacity>
      </View>

      {/* Map Modal for Area Selection */}
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.mapModal}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Tegn Event Område</Text>
            <TouchableOpacity onPress={() => setShowMap(false)} style={styles.mapCloseButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: areaCoordinates.length > 0
                ? areaCoordinates[0].latitude
                : 56.26,
              longitude: areaCoordinates.length > 0
                ? areaCoordinates[0].longitude
                : 9.5,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              addAreaPoint({ latitude, longitude });
            }}
          >
            {/* Show markers for each point */}
            {areaCoordinates.map((coord, index) => (
              <Marker
                key={index}
                coordinate={coord}
                title={`Punkt ${index + 1}`}
                pinColor={colors.primary}
              />
            ))}

            {/* Show polygon if we have at least 3 points */}
            {areaCoordinates.length >= 3 && (
              <Polygon
                coordinates={areaCoordinates}
                fillColor="rgba(66, 165, 245, 0.3)"
                strokeColor={colors.primary}
                strokeWidth={2}
              />
            )}
          </MapView>
          <View style={styles.mapFooter}>
            <Text style={styles.mapHint}>
              Tryk på kortet for at tilføje punkter • {areaCoordinates.length} punkter
            </Text>
            <View style={styles.mapButtonRow}>
              <TouchableOpacity
                style={[styles.mapActionButton, styles.mapUndoButton]}
                onPress={undoLastPoint}
                disabled={areaCoordinates.length === 0}
              >
                <Ionicons name="arrow-undo" size={20} color="white" />
                <Text style={styles.mapActionButtonText}>Fortryd</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapActionButton, styles.mapClearButton]}
                onPress={clearArea}
                disabled={areaCoordinates.length === 0}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.mapActionButtonText}>Ryd</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapActionButton, styles.mapConfirmButton]}
                onPress={() => setShowMap(false)}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.mapActionButtonText}>Bekræft</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
