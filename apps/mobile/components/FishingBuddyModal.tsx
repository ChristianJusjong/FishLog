import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface FishingBuddyModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BuddyPost {
  id: string;
  userName: string;
  destination: string;
  dateText: string;
  targetSpecies: string;
  notes: string;
  seatsAvailable: number;
}

const SAMPLE_BUDDY_POSTS: BuddyPost[] = [
  {
    id: '1',
    userName: 'Kasper V.',
    destination: 'Isefjorden (Tempelkrogen)',
    dateText: 'Lørdag kl. 05:30',
    targetSpecies: 'Havørred',
    notes: 'Kører fra Roskilde. Har plads til 1 i bilen. DMI lover 4 m/s SV!',
    seatsAvailable: 1,
  },
  {
    id: '2',
    userName: 'Morten S.',
    destination: 'Stevns Klint (Rødvig)',
    dateText: 'Søndag kl. 06:00',
    targetSpecies: 'Havørred / Hornfisk',
    notes: 'Vadefiskeri langs kanten. Tager kaffe og ekstra blink med.',
    seatsAvailable: 2,
  },
];

export default function FishingBuddyModal({
  visible,
  onClose,
}: FishingBuddyModalProps) {
  const { colors, isDark } = useTheme();
  const [posts, setPosts] = useState<BuddyPost[]>(SAMPLE_BUDDY_POSTS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [dateText, setDateText] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreatePost = () => {
    if (!destination.trim()) {
      Alert.alert('Mangler destination', 'Indtast venligst hvor turen går hen.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const newPost: BuddyPost = {
      id: Date.now().toString(),
      userName: 'Mig',
      destination,
      dateText: dateText || 'I weekenden',
      targetSpecies: 'Kystfiskeri',
      notes: notes || 'Hvem vil med ud at svinge stangen?',
      seatsAvailable: 1,
    };

    setPosts([newPost, ...posts]);
    setShowCreateForm(false);
    setDestination('');
    setDateText('');
    setNotes('');
    Alert.alert('Tur Slået Op! 🎣', 'Dine fiskekammerater og lokale lystfiskere kan nu se turen i feedet.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? '#071524' : '#FFFFFF',
              borderColor: isDark ? 'rgba(0, 212, 178, 0.3)' : 'rgba(0, 212, 178, 0.2)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="people" size={20} color="#00D4B2" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Fiskemakker-Finder 🤝</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Find en makker eller slå en tur op
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Create Trip Button */}
            {!showCreateForm ? (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowCreateForm(true);
                }}
              >
                <LinearGradient
                  colors={['#00D4B2', '#009688']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtnGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#071524" />
                  <Text style={styles.createBtnText}>Slå en fisketur op</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.formCard, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC' }]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Ny Fisketur</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Destination (f.eks. Møns Klint Rev)"
                  placeholderTextColor={colors.textSecondary}
                  value={destination}
                  onChangeText={setDestination}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Tidspunkt (f.eks. Lørdag kl. 06:00)"
                  placeholderTextColor={colors.textSecondary}
                  value={dateText}
                  onChangeText={setDateText}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Besked / Samkørsel / Kaffe..."
                  placeholderTextColor={colors.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#00D4B2' }]}
                    onPress={handleCreatePost}
                  >
                    <Text style={{ color: '#071524', fontWeight: '800' }}>Opret Tur</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                    onPress={() => setShowCreateForm(false)}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>Annuller</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Posts List */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Aktuelle Ture i Nærområdet</Text>
            {posts.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.postCard,
                  { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.userName, { color: colors.text }]}>{p.userName}</Text>
                  <View style={styles.seatBadge}>
                    <Ionicons name="car" size={12} color="#00D4B2" />
                    <Text style={styles.seatBadgeText}>{p.seatsAvailable} plads ledig</Text>
                  </View>
                </View>

                <Text style={[styles.postDest, { color: '#00D4B2' }]}>📍 {p.destination}</Text>
                <Text style={[styles.postDate, { color: colors.textSecondary }]}>⏰ {p.dateText}</Text>
                <Text style={[styles.postNotes, { color: colors.text }]}>{p.notes}</Text>

                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    Alert.alert('Skriv til Makker 💬', `Vil du sende en besked til ${p.userName} om turen?`, [
                      { text: 'Nej', style: 'cancel' },
                      { text: 'Send Besked', style: 'default' },
                    ]);
                  }}
                >
                  <Ionicons name="chatbubble" size={14} color="#071524" />
                  <Text style={styles.joinBtnText}>Skriv til {p.userName}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  createBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  createBtnText: {
    color: '#071524',
    fontSize: 14,
    fontWeight: '800',
  },
  formCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  postCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
  },
  seatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  seatBadgeText: {
    color: '#00D4B2',
    fontSize: 11,
    fontWeight: '700',
  },
  postDest: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  postDate: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  postNotes: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D4B2',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  joinBtnText: {
    color: '#071524',
    fontSize: 12,
    fontWeight: '800',
  },
});
