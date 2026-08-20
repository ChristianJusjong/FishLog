import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useOnboardingJourney } from '../contexts/OnboardingJourneyContext';
import PageLayout from '../components/PageLayout';
import { FISHING_KNOTS, FishingKnot } from '../data/knotsDatabase';

export default function KnotsScreen() {
  const { colors, isDark } = useTheme();
  const { completeMilestone } = useOnboardingJourney();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeKnot, setActiveKnot] = useState<FishingKnot | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'line-to-line', label: 'Line-til-line' },
    { id: 'line-to-hook', label: 'Line-til-krog' },
    { id: 'loop', label: 'Løkkeknob' },
    { id: 'special', label: 'Special-rigs' },
  ];

  const filteredKnots = useMemo(() => {
    return FISHING_KNOTS.filter((knot) => {
      const matchesSearch =
        knot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        knot.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        knot.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || knot.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenKnot = (knot: FishingKnot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveKnot(knot);
    setCurrentStepIndex(0);
    completeMilestone('learn_knot');
  };

  const handleNextStep = () => {
    if (!activeKnot) return;
    if (currentStepIndex < activeKnot.steps.length - 1) {
      Haptics.selectionAsync().catch(() => {});
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      Haptics.selectionAsync().catch(() => {});
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                🪢 Knob & Rig Masterclass
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                100% offline trin-for-trin fiskeknob
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.iconDefault} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Søg på knude, fletline, FG, woblere..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedCategory(cat.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Knot Cards List */}
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {filteredKnots.map((knot) => (
              <TouchableOpacity
                key={knot.id}
                style={[
                  styles.knotCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => handleOpenKnot(knot)}
                activeOpacity={0.8}
              >
                {/* Top Row: Name & Strength */}
                <View style={styles.cardHeader}>
                  <Text style={[styles.knotName, { color: colors.text }]}>{knot.name}</Text>
                  <View style={styles.strengthBadge}>
                    <Text style={styles.strengthText}>{knot.strengthPercent}% Styrke</Text>
                  </View>
                </View>

                <Text style={[styles.knotBestFor, { color: colors.accent }]}>
                  🎯 {knot.bestFor}
                </Text>

                <Text style={[styles.knotDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {knot.description}
                </Text>

                {/* Bottom Meta Row */}
                <View style={styles.cardFooter}>
                  {/* Difficulty stars */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginRight: 4 }}>Sværhed:</Text>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={12}
                        color={star <= knot.difficulty ? '#F5A623' : colors.border}
                      />
                    ))}
                  </View>

                  {/* Lines Chips */}
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {knot.recommendedLines.map((line, i) => (
                      <View key={i} style={[styles.lineBadge, { backgroundColor: colors.backgroundLight }]}>
                        <Text style={[styles.lineBadgeText, { color: colors.textSecondary }]}>{line}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>

        {/* Step-by-Step Interactive Modal */}
        {activeKnot && (
          <Modal
            visible={activeKnot !== null}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setActiveKnot(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{activeKnot.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '700' }}>
                      {activeKnot.categoryLabel} • {activeKnot.strengthPercent}% brudstyrke
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveKnot(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={26} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Step Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${((currentStepIndex + 1) / activeKnot.steps.length) * 100}%`,
                          backgroundColor: colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    Trin {currentStepIndex + 1} af {activeKnot.steps.length}
                  </Text>
                </View>

                {/* Step Content Card */}
                <ScrollView style={styles.stepBody} showsVerticalScrollIndicator={false}>
                  <View style={[styles.stepCard, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
                    <View style={[styles.stepNumberBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.stepNumberText}>{currentStepIndex + 1}</Text>
                    </View>
                    <Text style={[styles.stepInstruction, { color: colors.text }]}>
                      {activeKnot.steps[currentStepIndex].instruction}
                    </Text>

                    {activeKnot.steps[currentStepIndex].tip && (
                      <View style={styles.stepTipBox}>
                        <Ionicons name="bulb" size={16} color="#D97706" />
                        <Text style={styles.stepTipText}>
                          {activeKnot.steps[currentStepIndex].tip}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Pro Tip Section */}
                  <View style={styles.proTipContainer}>
                    <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#10B981' }}>Ekspert Tip:</Text>
                      <Text style={[styles.proTipBody, { color: colors.text }]}>{activeKnot.proTip}</Text>
                    </View>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Footer Navigation Buttons */}
                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[
                      styles.stepNavBtn,
                      { opacity: currentStepIndex === 0 ? 0.3 : 1, borderColor: colors.border, borderWidth: 1 },
                    ]}
                    onPress={handlePrevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <Ionicons name="arrow-back" size={18} color={colors.text} />
                    <Text style={[styles.stepNavBtnText, { color: colors.text }]}>Forrige</Text>
                  </TouchableOpacity>

                  {currentStepIndex < activeKnot.steps.length - 1 ? (
                    <TouchableOpacity style={styles.stepNextBtn} onPress={handleNextStep} activeOpacity={0.85}>
                      <LinearGradient
                        colors={[colors.accent, colors.accentDark || '#D4880F']}
                        style={styles.stepNextBtnGradient}
                      >
                        <Text style={styles.stepNextBtnText}>Næste trin</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.stepNextBtn}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                        setActiveKnot(null);
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.stepNextBtnGradient}
                      >
                        <Text style={styles.stepNextBtnText}>Færdig</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoryContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  knotCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  knotName: {
    fontSize: 16,
    fontWeight: '800',
  },
  strengthBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  strengthText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
  },
  knotBestFor: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  knotDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  lineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: 450,
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
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  stepBody: {
    paddingHorizontal: 20,
  },
  stepCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    position: 'relative',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  stepInstruction: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  stepTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  stepTipText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },
  proTipContainer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  proTipBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  stepNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  stepNavBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepNextBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  stepNextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  stepNextBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
