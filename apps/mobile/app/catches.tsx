import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import WeatherLocationCard from '../components/WeatherLocationCard';

const API_URL = 'https://fishlog-production.up.railway.app';

interface Catch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export default function CatchesScreen() {
  const router = useRouter();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchCatches();
    }, [])
  );

  const fetchCatches = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Ikke logget ind', 'Du skal logge ind først', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/catches?userId=me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCatches(data);
      } else if (response.status === 401) {
        Alert.alert('Session udløbet', 'Log venligst ind igen', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente fangster');
      }
    } catch (error) {
      Alert.alert('Fejl', error instanceof Error ? error.message : 'Ukendt fejl');
    } finally {
      setLoading(false);
    }
  };

  const deleteCatch = async (id: string) => {
    console.log('deleteCatch called with id:', id);

    // Use native confirm for web, Alert.alert for native
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Er du sikker på, at du vil slette denne fangst?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Slet fangst',
            'Er du sikker på, at du vil slette denne fangst?',
            [
              { text: 'Annuller', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Slet', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) {
      console.log('User cancelled delete');
      return;
    }

    console.log('User confirmed delete for id:', id);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('Making DELETE request to:', `${API_URL}/catches/${id}`);

      const response = await fetch(`${API_URL}/catches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('DELETE response status:', response.status);

      if (response.ok) {
        console.log('Delete successful, updating state');
        // Update state immediately to remove deleted catch
        setCatches(prevCatches => prevCatches.filter(c => c.id !== id));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', errorData);
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top']}>
        <Text style={styles.loadingText}>Indlæser fangster...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity
        style={[styles.button, styles.addButton]}
        onPress={() => router.push('/add-catch')}
      >
        <Text style={styles.buttonText}>+ Tilføj Fangst</Text>
      </TouchableOpacity>

      {catches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emoji}>🎣</Text>
          <Text style={styles.emptyText}>Ingen fangster endnu</Text>
          <Text style={styles.emptySubtext}>Tilføj din første fangst!</Text>
        </View>
      ) : (
        <View style={styles.catchesList}>
          {catches.map((catch_) => (
            <TouchableOpacity
              key={catch_.id}
              style={styles.catchCard}
              onPress={() => router.push(`/catch-detail?id=${catch_.id}`)}
              activeOpacity={0.9}
            >
              {catch_.photoUrl && (
                <Image source={{ uri: catch_.photoUrl }} style={styles.catchImage} />
              )}

              <View style={styles.catchHeader}>
                <Text style={styles.catchSpecies}>{catch_.species}</Text>
                <Text style={styles.catchDate}>
                  {new Date(catch_.createdAt).toLocaleDateString('da-DK')}
                </Text>
              </View>

              <View style={styles.catchDetails}>
                {catch_.lengthCm && (
                  <Text style={styles.catchDetail}>📏 {catch_.lengthCm} cm</Text>
                )}
                {catch_.weightKg && (
                  <Text style={styles.catchDetail}>⚖️ {Math.round(catch_.weightKg * 1000)} g</Text>
                )}
              </View>

              {catch_.bait && (
                <Text style={styles.catchInfo}>🪱 Agn: {catch_.bait}</Text>
              )}
              {catch_.technique && (
                <Text style={styles.catchInfo}>🎯 Teknik: {catch_.technique}</Text>
              )}
              {catch_.latitude && catch_.longitude && (
                <Text style={styles.catchInfo}>
                  📍 Position: {catch_.latitude.toFixed(4)}, {catch_.longitude.toFixed(4)}
                </Text>
              )}
              {catch_.notes && (
                <Text style={styles.catchNotes}>{catch_.notes}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
  catchesList: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  catchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  catchImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  catchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catchSpecies: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  catchDate: {
    fontSize: 14,
    color: '#666',
  },
  catchDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catchDetail: {
    fontSize: 16,
    color: '#333',
    marginRight: 16,
  },
  catchInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  catchNotes: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  deleteButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
