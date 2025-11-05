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

const API_URL = 'http://192.168.86.236:3000';

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
            <option value="public">🌍 Offentlig (alle kan se)</option>
            <option value="friends">👥 Venner (kun dine venner)</option>
            <option value="private">🔒 Privat (kun dig)</option>
          </select>
        ) : (
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('public')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextSelected]}>
                🌍 Offentlig
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'friends' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('friends')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'friends' && styles.visibilityTextSelected]}>
                👥 Venner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('private')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextSelected]}>
                🔒 Privat
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
              <Text style={styles.addButtonText}>+ Tilføj</Text>
            </TouchableOpacity>
          </View>

          {contests.map((contest, index) => (
            <View key={index} style={styles.contestCard}>
              <View style={styles.contestHeader}>
                <Text style={styles.contestLabel}>Konkurrence #{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeContest(index)}
                  disabled={loading}
                >
                  <Text style={styles.removeButton}>🗑️</Text>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
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
    gap: 8,
  },
  visibilityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  visibilityOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  visibilityTextSelected: {
    color: '#007AFF',
  },
  contestsSection: {
    marginTop: 20,
  },
  contestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contestCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contestLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    fontSize: 20,
  },
  contestFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  contestInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
