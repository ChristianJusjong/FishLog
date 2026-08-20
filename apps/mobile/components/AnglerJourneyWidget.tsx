import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useOnboardingJourney, JourneyMilestone } from '../contexts/OnboardingJourneyContext';

export default function AnglerJourneyWidget() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const {
    milestones,
    completedCount,
    totalCount,
    progressPercent,
    currentMilestone,
  } = useOnboardingJourney();

  const [showAllModal, setShowAllModal] = useState(false);

  // If all milestones completed, show master banner
  const isMaster = completedCount === totalCount;

  const handleAction = (milestone: JourneyMilestone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setShowAllModal(false);
    router.push(milestone.routeTo as any);
  };

  const getRankTitle = () => {
    if (completedCount <= 2) return 'Begynder Lystfisker';
    if (completedCount <= 5) return 'Aktiv Kystjæger';
    if (completedCount <= 8) return 'Erfaren Storfanger';
    return 'Danmarks Fiske-Mester 👑';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(7, 26, 46, 0.85)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(0, 212, 178, 0.25)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
        onPress={() => setShowAllModal(true)}
        activeOpacity={0.9}
      >
        {/* Top Rank & Progress Header */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <LinearGradient
              colors={['#00D4B2', '#0A7B6E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rankIconBadge}
            >
              <Ionicons name="trophy" size={14} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.rankLabel, { color: colors.textSecondary }]}>DIN LYSTFISKER-REJSE</Text>
              <Text style={[styles.rankTitle, { color: colors.text }]}>{getRankTitle()}</Text>
            </View>
          </View>

          <View style={styles.progressPercentBadge}>
            <Text style={styles.progressPercentText}>{completedCount}/{totalCount} ({progressPercent}%)</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <LinearGradient
            colors={['#00D4B2', '#F5A623']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${Math.max(8, progressPercent)}%` }]}
          />
        </View>

        {/* Next Step Focus */}
        {currentMilestone && !isMaster ? (
          <View style={[styles.nextStepBox, { backgroundColor: isDark ? 'rgba(0, 212, 178, 0.08)' : '#F0FDF4' }]}>
            <View style={styles.nextStepHeader}>
              <View style={styles.nextStepIconCircle}>
                <Ionicons name={(currentMilestone.badgeIcon as any) || 'sparkles'} size={16} color="#00D4B2" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                    Næste skridt: {currentMilestone.title}
                  </Text>
                  <Text style={styles.nextStepXp}>+{currentMilestone.xpReward} XP</Text>
                </View>
                <Text style={[styles.nextStepDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {currentMilestone.description}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction(currentMilestone)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>{currentMilestone.buttonLabel}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.nextStepBox, { backgroundColor: 'rgba(245, 166, 35, 0.12)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="ribbon" size={24} color="#F5A623" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.nextStepTitle, { color: colors.text }]}>Mester-Niveau Opnået!</Text>
                <Text style={[styles.nextStepDesc, { color: colors.textSecondary }]}>
                  Du har mestret alle dele af Hook og optjent alle begynder-trofæer!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer info link */}
        <View style={styles.cardFooter}>
          <Text style={[styles.footerHint, { color: colors.textTertiary }]}>
            Tryk for at se alle {totalCount} opgaver & oplåste badges
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>

      {/* Full Journey Roadmap Modal */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#071524' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Din Lystfisker-Rejse</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Gennemfør opgaverne for at mestre Hook og stige i rang
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAllModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* List of all milestones */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalList}>
              {milestones.map((m, index) => {
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.milestoneItem,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        borderColor: m.completed
                          ? '#00D4B2'
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <View style={styles.milestoneLeft}>
                      <View
                        style={[
                          styles.milestoneIconBox,
                          {
                            backgroundColor: m.completed
                              ? '#00D4B2'
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#E2E8F0',
                          },
                        ]}
                      >
                        <Ionicons
                          name={(m.badgeIcon as any) || 'fish'}
                          size={18}
                          color={m.completed ? '#FFFFFF' : colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.milestoneTitle, { color: colors.text }]}>
                            {index + 1}. {m.title}
                          </Text>
                          {m.completed && (
                            <Ionicons name="checkmark-circle" size={16} color="#00D4B2" />
                          )}
                        </View>
                        <Text style={[styles.milestoneDesc, { color: colors.textSecondary }]}>
                          {m.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.milestoneRight}>
                      <View style={styles.milestoneXpBadge}>
                        <Text style={styles.milestoneXpText}>+{m.xpReward} XP</Text>
                      </View>
                      {!m.completed && (
                        <TouchableOpacity
                          style={styles.milestoneActionBtn}
                          onPress={() => handleAction(m)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.milestoneActionText}>Start</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rankTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressPercentBadge: {
    backgroundColor: 'rgba(0, 212, 178, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D4B2',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextStepBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  nextStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  nextStepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 178, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextStepXp: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F5A623',
  },
  nextStepDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: '#00D4B2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#071524',
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerHint: {
    fontSize: 11,
    fontWeight: '500',
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
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalList: {
    padding: 16,
    gap: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  milestoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  milestoneRight: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },
  milestoneXpBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  milestoneXpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F5A623',
  },
  milestoneActionBtn: {
    backgroundColor: '#00D4B2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  milestoneActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#071524',
  },
});
