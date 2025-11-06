import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapPicker from '../components/MapPicker';

const API_URL = 'https://fishlog-production.up.railway.app';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

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
  user: User;
  likesCount?: number;
  commentsCount?: number;
  isLikedByMe?: boolean;
  comments?: Comment[];
  visibility?: string;
}

export default function CatchDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const catchId = params.id as string;

  const [catchData, setCatchData] = useState<Catch | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCatchDetail();
    fetchCurrentUser();
  }, [catchId]);

  const fetchCurrentUser = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchCatchDetail = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Catch detail data:', data);
        console.log('Has coordinates?', {
          latitude: data.latitude,
          longitude: data.longitude,
          hasCoords: !!(data.latitude && data.longitude)
        });
        setCatchData(data);
      } else {
        if (Platform.OS === 'web') {
          alert('Fejl: Kunne ikke hente fangst');
        } else {
          Alert.alert('Fejl', 'Kunne ikke hente fangst');
        }
        router.back();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const deleteCatch = async () => {
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

    if (!confirmed) return;

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/catches/${catchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('Fangst slettet');
        } else {
          Alert.alert('Succes', 'Fangst slettet');
        }
        router.back();
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorData.error || 'Status: ' + response.status}`);
        } else {
          Alert.alert('Fejl', errorData.error || `Status: ${response.status}`);
        }
      }
    } catch (error) {
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Indlæser...</Text>
      </View>
    );
  }

  if (!catchData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Fangst ikke fundet</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Tilbage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnCatch = currentUserId === catchData.user.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User info */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          {catchData.user.avatar && (
            <Image source={{ uri: catchData.user.avatar }} style={styles.userAvatar} />
          )}
          <View>
            <Text style={styles.userName}>{catchData.user.name}</Text>
            <Text style={styles.catchDate}>
              {new Date(catchData.createdAt).toLocaleDateString('da-DK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        {catchData.visibility && (
          <View style={styles.visibilityBadge}>
            <Text style={styles.visibilityText}>
              {catchData.visibility === 'private' && '🔒 Privat'}
              {catchData.visibility === 'friends' && '👥 Venner'}
              {catchData.visibility === 'public' && '🌍 Offentlig'}
            </Text>
          </View>
        )}
      </View>

      {/* Catch photo - full width, large */}
      {catchData.photoUrl && (
        <Image
          source={{ uri: catchData.photoUrl }}
          style={styles.catchImageLarge}
          resizeMode="contain"
        />
      )}

      {/* Catch details */}
      <View style={styles.catchContent}>
        <Text style={styles.catchSpecies}>{catchData.species}</Text>

        <View style={styles.catchDetailsRow}>
          {catchData.lengthCm && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Længde</Text>
              <Text style={styles.statValue}>📏 {catchData.lengthCm} cm</Text>
            </View>
          )}
          {catchData.weightKg && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Vægt</Text>
              <Text style={styles.statValue}>⚖️ {Math.round(catchData.weightKg * 1000)} g</Text>
            </View>
          )}
        </View>

        {catchData.bait && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🪱 Agn:</Text>
            <Text style={styles.infoValue}>{catchData.bait}</Text>
          </View>
        )}
        {catchData.rig && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎣 Forfang:</Text>
            <Text style={styles.infoValue}>{catchData.rig}</Text>
          </View>
        )}
        {catchData.technique && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎯 Teknik:</Text>
            <Text style={styles.infoValue}>{catchData.technique}</Text>
          </View>
        )}

        {catchData.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>📝 Noter</Text>
            <Text style={styles.notesText}>{catchData.notes}</Text>
          </View>
        )}

        {/* Map */}
        {catchData.latitude && catchData.longitude ? (
          <View style={styles.mapContainer}>
            <Text style={styles.mapLabel}>📍 Fangststed</Text>
            <Text style={styles.debugText}>
              Koordinater: {catchData.latitude.toFixed(6)}, {catchData.longitude.toFixed(6)}
            </Text>
            <MapPicker
              latitude={catchData.latitude}
              longitude={catchData.longitude}
              onLocationSelect={() => {}}
              readOnly={true}
            />
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <Text style={styles.mapLabel}>📍 Fangststed</Text>
            <Text style={styles.debugText}>Ingen koordinater tilgængelige</Text>
          </View>
        )}
      </View>

      {/* Action buttons - only show for own catches */}
      {isOwnCatch && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.push(`/edit-catch?id=${catchId}`)}
          >
            <Text style={styles.buttonText}>✏️ Rediger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={deleteCatch}
          >
            <Text style={styles.buttonText}>🗑️ Slet</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    alignSelf: 'flex-start',
    margin: 16,
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
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 50,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  catchDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  visibilityBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  visibilityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  catchImageLarge: {
    width: '100%',
    height: 400,
    maxHeight: Dimensions.get('window').height * 0.5,
    backgroundColor: '#f0f0f0',
  },
  catchContent: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 1,
  },
  catchSpecies: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  catchDetailsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notesContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  mapContainer: {
    marginTop: 20,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
