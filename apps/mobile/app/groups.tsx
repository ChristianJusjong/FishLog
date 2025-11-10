import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, FAB } from '@/constants/branding';
import BottomNavigation from '../components/BottomNavigation';
import { API_URL } from '../config/api';
import { logger } from '../utils/logger';
import { authStorage } from '../utils/secureStorage';

type Group = {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isPrivate: boolean;
  isMember: boolean;
  isPending: boolean;
  role?: 'ADMIN' | 'MEMBER';
};

export default function GroupsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const accessToken = await authStorage.getToken();

      // Fetch my groups
      const myGroupsResponse = await fetch(`${API_URL}/groups/my-groups`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // Fetch available groups
      const availableResponse = await fetch(`${API_URL}/groups/available`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (myGroupsResponse.ok && availableResponse.ok) {
        const myGroupsData = await myGroupsResponse.json();
        const availableData = await availableResponse.json();
        setMyGroups(myGroupsData);
        setAvailableGroups(availableData);
      } else {
        Alert.alert('Fejl', 'Kunne ikke hente grupper');
      }
    } catch (error) {
      logger.error('Failed to fetch groups:', error);
      Alert.alert('Fejl', 'Kunne ikke hente grupper');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Fejl', 'Gruppenavn er påkrævet');
      return;
    }

    setCreating(true);
    try {
      const accessToken = await authStorage.getToken();

      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          isPrivate,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Gruppe oprettet');
        setShowCreateModal(false);
        setGroupName('');
        setGroupDescription('');
        setIsPrivate(false);
        fetchGroups();
      } else {
        const errorData = await response.json();
        logger.error('Failed to create group - response:', errorData);
        Alert.alert('Fejl', errorData.error || errorData.message || 'Kunne ikke oprette gruppe');
      }
    } catch (error) {
      logger.error('Failed to create group - exception:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette gruppe: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setCreating(false);
    }
  };

  const requestMembership = async (groupId: string) => {
    try {
      const accessToken = await authStorage.getToken();

      const response = await fetch(`${API_URL}/groups/${groupId}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Anmodning sendt');
        fetchGroups();
      } else {
        const errorData = await response.json();
        Alert.alert('Fejl', errorData.error || 'Kunne ikke sende anmodning');
      }
    } catch (error) {
      logger.error('Failed to request membership:', error);
      Alert.alert('Fejl', 'Kunne ikke sende anmodning');
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const accessToken = await authStorage.getToken();

      const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Du er nu medlem af gruppen');
        fetchGroups();
      } else {
        const errorData = await response.json();
        Alert.alert('Fejl', errorData.error || 'Kunne ikke deltage i gruppe');
      }
    } catch (error) {
      logger.error('Failed to join group:', error);
      Alert.alert('Fejl', 'Kunne ikke deltage i gruppe');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundLight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundLight }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.primary }]}>‹ Tilbage</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Grupper</Text>
        <View style={styles.backButton} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        {/* My Groups Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mine Grupper</Text>
          {myGroups.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Du er ikke medlem af nogen grupper endnu
              </Text>
            </View>
          ) : (
            myGroups.map((group) => (
              <View key={group.id} style={[styles.groupCard, { backgroundColor: theme.surface }]}>
                <View style={styles.groupHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.groupTitleRow}>
                      <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
                      {group.role === 'ADMIN' && (
                        <View style={[styles.adminBadge, { backgroundColor: theme.accent + '20' }]}>
                          <Text style={[styles.adminBadgeText, { color: theme.accent }]}>⭐ Admin</Text>
                        </View>
                      )}
                    </View>
                    {group.description && (
                      <Text style={[styles.groupDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {group.description}
                      </Text>
                    )}
                  </View>
                  {group.isPrivate && (
                    <View style={[styles.privateBadge, { backgroundColor: theme.warning + '20' }]}>
                      <Text style={[styles.privateBadgeText, { color: theme.warning }]}>🔒 Privat</Text>
                    </View>
                  )}
                </View>
                <View style={styles.groupFooter}>
                  <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
                    👥 {group.memberCount} medlemmer
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Available Groups Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tilgængelige Grupper</Text>
          {availableGroups.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Ingen tilgængelige grupper
              </Text>
            </View>
          ) : (
            availableGroups.map((group) => (
              <View key={group.id} style={[styles.groupCard, { backgroundColor: theme.surface }]}>
                <View style={styles.groupHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
                    {group.description && (
                      <Text style={[styles.groupDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {group.description}
                      </Text>
                    )}
                  </View>
                  {group.isPrivate && (
                    <View style={[styles.privateBadge, { backgroundColor: theme.warning + '20' }]}>
                      <Text style={[styles.privateBadgeText, { color: theme.warning }]}>🔒 Privat</Text>
                    </View>
                  )}
                </View>
                <View style={styles.groupFooter}>
                  <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
                    👥 {group.memberCount} medlemmer
                  </Text>
                  {group.isPending ? (
                    <View style={[styles.pendingButton, { backgroundColor: theme.textSecondary + '20' }]}>
                      <Text style={[styles.pendingButtonText, { color: theme.textSecondary }]}>Afventer godkendelse</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.joinButton, { backgroundColor: theme.primary }]}
                      onPress={() => group.isPrivate ? requestMembership(group.id) : joinGroup(group.id)}
                    >
                      <Text style={[styles.joinButtonText, { color: theme.textInverse }]}>
                        {group.isPrivate ? 'Anmod om medlemskab' : 'Deltag'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.accent }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Opret Gruppe</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: theme.text }]}>Gruppenavn *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundLight, color: theme.text, borderColor: theme.border }]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="F.eks. Aalborg Fiskeklub"
                placeholderTextColor={theme.textTertiary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Beskrivelse</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundLight, color: theme.text, borderColor: theme.border }]}
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Fortæl om gruppen..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <View style={[styles.checkbox, { borderColor: theme.border }, isPrivate && { backgroundColor: theme.primary }]}>
                  {isPrivate && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkboxLabel, { color: theme.text }]}>Privat gruppe</Text>
                  <Text style={[styles.checkboxDescription, { color: theme.textSecondary }]}>
                    Kræver godkendelse for at blive medlem
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.backgroundLight }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.primary }]}
                onPress={createGroup}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={theme.textInverse} />
                ) : (
                  <Text style={[styles.createButtonText, { color: theme.textInverse }]}>Opret Gruppe</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  groupCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
  },
  groupDescription: {
    fontSize: 14,
  },
  adminBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  privateBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  privateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
  },
  joinButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  pendingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: FAB.right,
    bottom: FAB.bottom,
    width: FAB.size,
    height: FAB.size,
    borderRadius: FAB.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
    elevation: 8,
    zIndex: 10,
  },
  floatingButtonText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '400',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 22,
  },
  createButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 22,
  },
});
