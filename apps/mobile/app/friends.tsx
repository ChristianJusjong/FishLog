import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from '../components/BottomNavigation';
import WeatherLocationCard from '../components/WeatherLocationCard';

const API_URL = 'https://fishlog-production.up.railway.app';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Friend {
  friendshipId: string;
  friend: User;
  since: string;
}

interface FriendRequest {
  friendshipId: string;
  user: User;
  sentAt?: string;
  receivedAt?: string;
}

interface FriendsData {
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
}

export default function FriendsScreen() {
  const router = useRouter();
  const [friendsData, setFriendsData] = useState<FriendsData>({
    friends: [],
    sentRequests: [],
    receivedRequests: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [])
  );

  const fetchFriends = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        if (Platform.OS === 'web') {
          alert('Ikke logget ind: Du skal logge ind først');
          router.replace('/login');
        } else {
          Alert.alert('Ikke logget ind', 'Du skal logge ind først', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/friends`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendsData(data);
      } else if (response.status === 401) {
        if (Platform.OS === 'web') {
          alert('Session udløbet: Log venligst ind igen');
          router.replace('/login');
        } else {
          Alert.alert('Session udløbet', 'Log venligst ind igen', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          alert('Fejl: Kunne ikke hente venner');
        } else {
          Alert.alert('Fejl', 'Kunne ikke hente venner');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMessage}`);
      } else {
        Alert.alert('Fejl', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.trim().length < 2) {
      if (Platform.OS === 'web') {
        alert('Indtast mindst 2 tegn');
      } else {
        Alert.alert('Fejl', 'Indtast mindst 2 tegn');
      }
      return;
    }

    setSearching(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/friends/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
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
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (accepterId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accepterId }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('Venneanmodning sendt!');
        } else {
          Alert.alert('Succes', 'Venneanmodning sendt!');
        }
        fetchFriends();
        setSearchResults([]);
        setSearchQuery('');
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

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/friends/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('Venneanmodning accepteret!');
        } else {
          Alert.alert('Succes', 'Venneanmodning accepteret!');
        }
        fetchFriends();
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

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/friends/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          alert('Venneanmodning afvist');
        } else {
          Alert.alert('Succes', 'Venneanmodning afvist');
        }
        fetchFriends();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top']}>
        <Text style={styles.loadingText}>Indlæser...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Weather & Location Card */}
      <WeatherLocationCard showLocation={true} showWeather={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Search section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Søg efter brugere</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Søg på navn eller email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchUsers}
            disabled={searching}
          >
            <Text style={styles.searchButtonText}>
              {searching ? 'Søger...' : 'Søg'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsList}>
            {searchResults.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  {user.avatar && (
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  )}
                  <View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => sendFriendRequest(user.id)}
                >
                  <Text style={styles.addButtonText}>Tilføj</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Received requests */}
      {friendsData.receivedRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anmodninger ({friendsData.receivedRequests.length})</Text>
          {friendsData.receivedRequests.map((request) => (
            <View key={request.friendshipId} style={styles.userCard}>
              <View style={styles.userInfo}>
                {request.user.avatar && (
                  <Image source={{ uri: request.user.avatar }} style={styles.userAvatar} />
                )}
                <View>
                  <Text style={styles.userName}>{request.user.name}</Text>
                  <Text style={styles.userEmail}>{request.user.email}</Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => acceptFriendRequest(request.friendshipId)}
                >
                  <Text style={styles.actionButtonText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => rejectFriendRequest(request.friendshipId)}
                >
                  <Text style={styles.actionButtonText}>Afvis</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Friends list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mine venner ({friendsData.friends.length})</Text>
        {friendsData.friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Ingen venner endnu</Text>
            <Text style={styles.emptySubtext}>Søg efter brugere for at tilføje venner</Text>
          </View>
        ) : (
          friendsData.friends.map((friend) => (
            <View key={friend.friendshipId} style={styles.userCard}>
              <View style={styles.userInfo}>
                {friend.friend.avatar && (
                  <Image source={{ uri: friend.friend.avatar }} style={styles.userAvatar} />
                )}
                <View>
                  <Text style={styles.userName}>{friend.friend.name}</Text>
                  <Text style={styles.userEmail}>{friend.friend.email}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Sent requests */}
      {friendsData.sentRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sendte anmodninger ({friendsData.sentRequests.length})</Text>
          {friendsData.sentRequests.map((request) => (
            <View key={request.friendshipId} style={styles.userCard}>
              <View style={styles.userInfo}>
                {request.user.avatar && (
                  <Image source={{ uri: request.user.avatar }} style={styles.userAvatar} />
                )}
                <View>
                  <Text style={styles.userName}>{request.user.name}</Text>
                  <Text style={styles.userEmail}>{request.user.email}</Text>
                  <Text style={styles.pendingText}>Venter på svar...</Text>
                </View>
              </View>
            </View>
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
  searchSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsList: {
    marginTop: 12,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  pendingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
