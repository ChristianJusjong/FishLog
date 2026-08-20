import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from '../components/PageLayout';
import { useTackleBox } from '../contexts/TackleBoxContext';

export default function TackleBoxScreen() {
  const { colors, isDark } = useTheme();
  const { rods, reels, lures, addRod, deleteRod, addReel, deleteReel, addLure, deleteLure } = useTackleBox();

  const [activeTab, setActiveTab] = useState<'rods' | 'reels' | 'lures'>('rods');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [detail1, setDetail1] = useState(''); // Length / Size / Color
  const [detail2, setDetail2] = useState(''); // Casting weight / Line / Lure Weight
  const [lureType, setLureType] = useState<'Blink' | 'Wobler' | 'Flue' | 'Jig/Gummi' | 'Spinner'>('Blink');

  const totalCatches = rods.reduce((sum, r) => sum + r.catchesCount, 0) +
                       reels.reduce((sum, rl) => sum + rl.catchesCount, 0);
  const totalWeight = rods.reduce((sum, r) => sum + r.totalWeightKg, 0);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Mangler navn', 'Indtast venligst et navn på dit grej.');
      return;
    }

    if (activeTab === 'rods') {
      await addRod({
        brand: brand.trim() || 'Custom',
        name: name.trim(),
        lengthFeet: detail1.trim() || undefined,
        castingWeight: detail2.trim() || undefined,
      });
    } else if (activeTab === 'reels') {
      await addReel({
        brand: brand.trim() || 'Custom',
        name: name.trim(),
        size: detail1.trim() || '2500',
        lineType: detail2.trim() || 'Fletline',
      });
    } else {
      await addLure({
        name: name.trim(),
        type: lureType,
        color: detail1.trim() || 'Naturtro',
        weightGrams: detail2.trim() || undefined,
      });
    }

    // Reset form
    setBrand('');
    setName('');
    setDetail1('');
    setDetail2('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string, itemName: string, type: 'rod' | 'reel' | 'lure') => {
    Alert.alert(
      'Slet grej',
      `Er du sikker på, at du vil fjerne "${itemName}" fra din grejboks?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            if (type === 'rod') await deleteRod(id);
            else if (type === 'reel') await deleteReel(id);
            else await deleteLure(id);
          },
        },
      ]
    );
  };

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>🧰 Digital Grejboks</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Hold styr på stænger, hjul og yndlingsagn
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addHeaderBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowAddModal(true);
              }}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Performance Overview Banner */}
          <View style={[styles.statsBanner, { backgroundColor: isDark ? '#0A2540' : '#EBF5FF', borderColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{rods.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stænger</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00D4B2' }]}>{lures.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Agn i Boksen</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{totalWeight.toFixed(1)} kg</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fanget Vægt</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'rods' && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('rods');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'rods' ? colors.accent : colors.textSecondary }]}>
                Stænger ({rods.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'reels' && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('reels');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'reels' ? colors.accent : colors.textSecondary }]}>
                Hjul & Liner ({reels.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'lures' && { borderBottomColor: colors.accent, borderBottomWidth: 3 },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('lures');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'lures' ? colors.accent : colors.textSecondary }]}>
                Endegrej ({lures.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content List */}
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {activeTab === 'rods' && (
              <>
                {rods.map((rod) => (
                  <View key={rod.id} style={[styles.gearCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.gearCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.brandText, { color: colors.accent }]}>{rod.brand}</Text>
                        <Text style={[styles.gearName, { color: colors.text }]}>{rod.name}</Text>
                        <Text style={[styles.gearSpecs, { color: colors.textSecondary }]}>
                          Længde: {rod.lengthFeet || 'Ikke angivet'} • Kastevægt: {rod.castingWeight || 'Variabel'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(rod.id, rod.name, 'rod')} style={styles.trashBtn}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.gearCardBottom}>
                      <View style={styles.hitRateBadge}>
                        <Ionicons name="fish" size={14} color="#10B981" />
                        <Text style={styles.hitRateText}>{rod.catchesCount} fangster</Text>
                      </View>
                      <Text style={[styles.totalKgText, { color: colors.textSecondary }]}>
                        I alt: <Text style={{ fontWeight: '700', color: colors.text }}>{rod.totalWeightKg} kg</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeTab === 'reels' && (
              <>
                {reels.map((reel) => (
                  <View key={reel.id} style={[styles.gearCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.gearCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.brandText, { color: colors.accent }]}>{reel.brand}</Text>
                        <Text style={[styles.gearName, { color: colors.text }]}>{reel.name}</Text>
                        <Text style={[styles.gearSpecs, { color: colors.textSecondary }]}>
                          Størrelse: {reel.size} • Line: {reel.lineType}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(reel.id, reel.name, 'reel')} style={styles.trashBtn}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.gearCardBottom}>
                      <View style={styles.hitRateBadge}>
                        <Ionicons name="fish" size={14} color="#10B981" />
                        <Text style={styles.hitRateText}>{reel.catchesCount} fangster</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeTab === 'lures' && (
              <>
                {lures.map((lure) => (
                  <View key={lure.id} style={[styles.gearCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.gearCardTop}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <View style={styles.lureTypeBadge}>
                            <Text style={styles.lureTypeBadgeText}>{lure.type}</Text>
                          </View>
                          {lure.weightGrams && (
                            <Text style={{ fontSize: 11, color: colors.textSecondary }}>{lure.weightGrams}</Text>
                          )}
                        </View>
                        <Text style={[styles.gearName, { color: colors.text }]}>{lure.name}</Text>
                        <Text style={[styles.gearSpecs, { color: colors.textSecondary }]}>
                          Farve: {lure.color}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(lure.id, lure.name, 'lure')} style={styles.trashBtn}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.gearCardBottom}>
                      <View style={styles.hitRateBadge}>
                        <Ionicons name="flash" size={14} color="#F5A623" />
                        <Text style={[styles.hitRateText, { color: '#B45309' }]}>{lure.catchesCount} fisk hugget</Text>
                      </View>
                      {lure.favoriteSpecies && (
                        <Text style={[styles.totalKgText, { color: colors.textSecondary }]}>
                          Top: {lure.favoriteSpecies}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>

        {/* Add Gear Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {activeTab === 'rods' ? 'Tilføj Ny Fiskestang' : activeTab === 'reels' ? 'Tilføj Nyt Fiskehjul' : 'Tilføj Nyt Endegrej'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                {activeTab !== 'lures' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mærke / Producent</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundLight }]}
                      placeholder="F.eks. Shimano, Westin, Savage Gear, Daiwa"
                      placeholderTextColor={colors.textSecondary}
                      value={brand}
                      onChangeText={setBrand}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Model / Navn *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundLight }]}
                    placeholder={activeTab === 'rods' ? 'F.eks. W3 Spin 2nd' : activeTab === 'reels' ? 'F.eks. Stradic FM' : 'F.eks. Sandeel 19g'}
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {activeTab === 'lures' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Agntype</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {(['Blink', 'Wobler', 'Flue', 'Jig/Gummi', 'Spinner'] as const).map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.typeChip,
                            lureType === t && { backgroundColor: colors.accent, borderColor: colors.accent },
                            { borderColor: colors.border },
                          ]}
                          onPress={() => setLureType(t)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: lureType === t ? '#FFFFFF' : colors.text }}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {activeTab === 'rods' ? 'Længde (f.eks. 9 fot / 274cm)' : activeTab === 'reels' ? 'Hjulstørrelse (f.eks. 2500)' : 'Farvekombination'}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundLight }]}
                    placeholder={activeTab === 'rods' ? "9'2 fot" : activeTab === 'reels' ? '2500' : 'Pink / Hvid UV'}
                    placeholderTextColor={colors.textSecondary}
                    value={detail1}
                    onChangeText={setDetail1}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {activeTab === 'rods' ? 'Kastevægt (f.eks. 7-28g)' : activeTab === 'reels' ? 'Påspolet line (f.eks. 0.12mm Flet)' : 'Vægt (f.eks. 19g)'}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundLight }]}
                    placeholder={activeTab === 'rods' ? '7-28g' : activeTab === 'reels' ? '0.12mm Fletline' : '19g'}
                    placeholderTextColor={colors.textSecondary}
                    value={detail2}
                    onChangeText={setDetail2}
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[colors.accent, colors.accentDark || '#D4880F']}
                    style={styles.submitBtnGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Gem i Grejboksen</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gearCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  gearCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gearName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  gearSpecs: {
    fontSize: 12,
    marginTop: 4,
  },
  trashBtn: {
    padding: 6,
  },
  gearCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  hitRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hitRateText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 11,
  },
  totalKgText: {
    fontSize: 12,
  },
  lureTypeBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lureTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F5A623',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
