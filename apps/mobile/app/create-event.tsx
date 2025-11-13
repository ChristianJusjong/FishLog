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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';

const API_URL = 'https://fishlog-production.up.railway.app';

const CONTEST_RULES = [
  { value: 'biggest_single', label: 'Største enkeltfisk' },
  { value: 'biggest_total', label: 'Samlet vægt' },
  { value: 'most_catches', label: 'Flest fangster' },
];

type Contest = {
  rule: 'biggest_single' | 'biggest_total' | 'most_catches';
  speciesFilter: string;
};

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('public');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);

  const addContest = () => {
    setContests([...contests, { rule: 'biggest_single', speciesFilter: '' }]);
  };

  const removeContest = (index: number) => {
    setContests(contests.filter((_, i) => i !== index));
  };

  const updateContest = (index: number, field: keyof Contest, value: string) => {
    const updated = [...contests];
    updated[index] = { ...updated[index], [field]: value };
    setContests(updated);
  };

  const handleSubmit = async () => {
    if (!title || !startAt || !endAt) {
      Alert.alert('Fejl', 'Titel, start- og sluttidspunkt er påkrævet');
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Alert.alert('Fejl', 'Ugyldigt datoformat. Brug: YYYY-MM-DD HH:MM');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Fejl', 'Starttidspunkt skal være før sluttidspunkt');
      return;
    }

    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const eventData = {
        title,
        description: description || undefined,
        venue: venue || undefined,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        visibility,
        contests: contests.map(c => ({
          rule: c.rule,
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

        <Text style={styles.label}>Starttidspunkt * (YYYY-MM-DD HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-06-15 08:00"
          value={startAt}
          onChangeText={setStartAt}
          editable={!loading}
        />

        <Text style={styles.label}>Sluttidspunkt * (YYYY-MM-DD HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-06-15 18:00"
          value={endAt}
          onChangeText={setEndAt}
          editable={!loading}
        />

        <Text style={styles.label}>Synlighed *</Text>
        {Platform.OS === 'web' ? (
          <select
            value={visibility}
            onChange={(e: any) => setVisibility(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ddd',
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
                color={visibility === 'public' ? COLORS.primary : COLORS.textSecondary}
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
                color={visibility === 'friends' ? COLORS.primary : COLORS.textSecondary}
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
                color={visibility === 'private' ? COLORS.primary : COLORS.textSecondary}
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
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.contestFieldLabel}>Regel</Text>
              {Platform.OS === 'web' ? (
                <select
                  value={contest.rule}
                  onChange={(e: any) => updateContest(index, 'rule', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#ddd',
                    fontSize: 14,
                    border: '1px solid #ddd',
                    marginBottom: 8,
                  }}
                  disabled={loading}
                >
                  {CONTEST_RULES.map(rule => (
                    <option key={rule.value} value={rule.value}>
                      {rule.label}
                    </option>
                  ))}
                </select>
              ) : (
                <TextInput
                  style={styles.contestInput}
                  value={CONTEST_RULES.find(r => r.value === contest.rule)?.label}
                  editable={false}
                />
              )}

              <Text style={styles.contestFieldLabel}>Fiskeart (valgfri)</Text>
              <TextInput
                style={styles.contestInput}
                placeholder="F.eks. Gedde (lad stå tom for alle)"
                value={contest.speciesFilter}
                onChangeText={(value) => updateContest(index, 'speciesFilter', value)}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: COLORS.text,
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    width: '100%',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
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
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  visibilityOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#e3f2fd',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  visibilityTextSelected: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contestCard: {
    backgroundColor: 'white',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: COLORS.text,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  contestFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: SPACING.sm,
  },
  contestInput: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
