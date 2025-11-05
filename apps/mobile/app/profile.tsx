import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import WeatherLocationCard from '../components/WeatherLocationCard';
import BottomNavigation from '../components/BottomNavigation';
import { COLORS } from '@/constants/branding';

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={styles.container}>
      {user.avatar && (
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      )}

      <View style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={[styles.infoContainer, styles.borderTop]}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={[styles.infoContainer, styles.borderTop]}>
          <Text style={styles.label}>Provider</Text>
          <Text style={styles.value}>{user.provider}</Text>
        </View>

        <View style={[styles.infoContainer, styles.borderTop]}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user.id}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.feedButton}
        onPress={() => router.push('/feed')}
      >
        <Text style={styles.buttonText}>📰 Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.friendsButton}
        onPress={() => router.push('/friends')}
      >
        <Text style={styles.buttonText}>👥 Venner</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.catchesButton}
        onPress={() => router.push('/catches')}
      >
        <Text style={styles.buttonText}>🐟 Mine Fangster</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addCatchButton}
        onPress={() => router.push('/add-catch')}
      >
        <Text style={styles.buttonText}>+ Tilføj Fangst</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.eventsButton}
        onPress={() => router.push('/events')}
      >
        <Text style={styles.buttonText}>🏆 Events</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => router.push('/map')}
      >
        <Text style={styles.buttonText}>🗺️ Fiskekort</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push('/edit-profile')}
      >
        <Text style={styles.buttonText}>✏️ Rediger Profil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Ud</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        OAuth 2.0 Authentication with JWT Tokens
      </Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  infoContainer: {
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  valueSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  feedButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendsButton: {
    backgroundColor: '#5856D6',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catchesButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addCatchButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
