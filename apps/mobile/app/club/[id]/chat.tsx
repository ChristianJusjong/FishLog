import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://hook-production.up.railway.app';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Catch {
  id: string;
  species?: string;
  weightKg?: number;
  lengthCm?: number;
  photoUrl?: string;
}

interface Message {
  id: string;
  clubId: string;
  senderId: string;
  sender: User;
  message?: string;
  imageUrl?: string;
  catchId?: string;
  catch?: Catch;
  createdAt: string;
}

interface Club {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  visibility: string;
  userRole?: string;
  isMember: boolean;
}

export default function ClubChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [club, setClub] = useState<Club | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [lastPollTime, setLastPollTime] = useState<string>(new Date().toISOString());

  // Modal states
  const [showCatchModal, setShowCatchModal] = useState(false);
  const [userCatches, setUserCatches] = useState<Catch[]>([]);
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null);

  useEffect(() => {
    fetchClub();
    fetchMessages();
  }, [id]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!club || !club.isMember) return;

    const interval = setInterval(() => {
      pollNewMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [id, lastPollTime, club]);

  const fetchClub = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/clubs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClub(data);

        if (!data.isMember) {
          Alert.alert('Adgang nægtet', 'Du er ikke medlem af denne klub');
          router.back();
        }
      } else {
        throw new Error('Failed to fetch club');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      Alert.alert('Fejl', 'Kunne ikke hente klub');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/clubs/${id}/messages?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setLastPollTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollNewMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${API_URL}/clubs/${id}/messages/poll?since=${lastPollTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const newMessages = await response.json();
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
          setLastPollTime(new Date().toISOString());
          // Scroll to bottom on new messages
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !selectedCatch) {
      return;
    }

    setSending(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const body: any = {};
      if (messageText.trim()) {
        body.message = messageText.trim();
      }
      if (selectedCatch) {
        body.catchId = selectedCatch.id;
      }

      const response = await fetch(`${API_URL}/clubs/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        setMessageText('');
        setSelectedCatch(null);
        setLastPollTime(new Date().toISOString());
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const error = await response.json();
        Alert.alert('Fejl', error.error || 'Kunne ikke sende besked');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Fejl', 'Kunne ikke sende besked');
    } finally {
      setSending(false);
    }
  };

  const fetchUserCatches = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/catches?userId=me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserCatches(data);
        setShowCatchModal(true);
      }
    } catch (error) {
      console.error('Error fetching catches:', error);
      Alert.alert('Fejl', 'Kunne ikke hente dine fangster');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Lige nu';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}t`;

    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender.id === messages[0]?.sender.id; // Simplified check

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.senderInfo}>
            {item.sender.avatar ? (
              <Image source={{ uri: item.sender.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {item.sender.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.senderName}>{item.sender.name}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {item.message && (
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {item.message}
            </Text>
          )}

          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          )}

          {item.catch && (
            <View style={styles.catchCard}>
              {item.catch.photoUrl && (
                <Image
                  source={{ uri: item.catch.photoUrl }}
                  style={styles.catchImage}
                />
              )}
              <View style={styles.catchInfo}>
                <Text style={styles.catchSpecies}>
                  {item.catch.species || 'Ukendt fisk'}
                </Text>
                {item.catch.weightKg && (
                  <Text style={styles.catchDetail}>⚖️ {item.catch.weightKg} kg</Text>
                )}
                {item.catch.lengthCm && (
                  <Text style={styles.catchDetail}>📏 {item.catch.lengthCm} cm</Text>
                )}
              </View>
            </View>
          )}

          <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.centerContainer}>
        <Text>Klub ikke fundet</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: club.name,
          headerBackTitle: 'Tilbage',
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Ingen beskeder endnu</Text>
              <Text style={styles.emptySubtext}>
                Vær den første til at skrive noget!
              </Text>
            </View>
          }
        />

        {selectedCatch && (
          <View style={styles.selectedCatchPreview}>
            <Text style={styles.previewLabel}>Vedhæftet fangst:</Text>
            <View style={styles.previewContent}>
              {selectedCatch.photoUrl && (
                <Image
                  source={{ uri: selectedCatch.photoUrl }}
                  style={styles.previewImage}
                />
              )}
              <Text style={styles.previewText}>
                {selectedCatch.species || 'Fangst'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCatch(null)}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={fetchUserCatches}
            disabled={sending}
          >
            <Text style={styles.attachButtonText}>🎣</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Skriv en besked..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            editable={!sending}
          />

          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={sending || (!messageText.trim() && !selectedCatch)}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Catch selection modal */}
      <Modal
        visible={showCatchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vælg en fangst</Text>
              <TouchableOpacity onPress={() => setShowCatchModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={userCatches}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.catchItem}
                  onPress={() => {
                    setSelectedCatch(item);
                    setShowCatchModal(false);
                  }}
                >
                  {item.photoUrl && (
                    <Image source={{ uri: item.photoUrl }} style={styles.catchThumb} />
                  )}
                  <View style={styles.catchItemInfo}>
                    <Text style={styles.catchItemSpecies}>
                      {item.species || 'Ukendt fisk'}
                    </Text>
                    {item.weightKg && (
                      <Text style={styles.catchItemDetail}>⚖️ {item.weightKg} kg</Text>
                    )}
                    {item.lengthCm && (
                      <Text style={styles.catchItemDetail}>📏 {item.lengthCm} cm</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>
                    Du har ingen fangster endnu
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  catchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  catchImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  catchInfo: {
    gap: 4,
  },
  catchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  catchDetail: {
    fontSize: 14,
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  selectedCatchPreview: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    fontSize: 20,
    color: '#ff3b30',
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  catchItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  catchThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  catchItemInfo: {
    flex: 1,
    gap: 4,
  },
  catchItemSpecies: {
    fontSize: 16,
    fontWeight: '600',
  },
  catchItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  emptyModal: {
    padding: 40,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 16,
    color: '#999',
  },
});
