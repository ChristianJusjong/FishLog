import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface CatchAndReleaseGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CatchAndReleaseGuideModal({
  visible,
  onClose,
}: CatchAndReleaseGuideModalProps) {
  const { colors, isDark } = useTheme();

  // 30s C&R recovery timer
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimerSeconds(30);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerSeconds(30);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? '#071524' : '#FFFFFF',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="leaf" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Skånsom Genudsætning (C&R)</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Fiskevelfærd & maksimal overlevelsesrate
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* 30s Breathing Timer */}
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(0, 212, 178, 0.12)']}
              style={styles.timerCard}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.timerNumber}>{timerSeconds}s</Text>
                <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
                  {timerRunning
                    ? 'Genopliv fisken i vandet mod strømmen...'
                    : timerSeconds === 0
                    ? 'Fisken er klar til release! 🐟'
                    : 'Start genoplivnings-timer'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.timerBtn, { backgroundColor: timerRunning ? '#EF4444' : '#10B981' }]}
                onPress={timerRunning ? resetTimer : startTimer}
              >
                <Ionicons name={timerRunning ? 'pause' : 'play'} size={18} color="#FFFFFF" />
                <Text style={styles.timerBtnText}>{timerRunning ? 'Stop' : 'Start 30s'}</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Step 1 */}
            <View style={[styles.stepCard, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC' }]}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Våde Hænder & Udstyr</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Rør aldrig en fisk med tørre hænder eller tørre handsker. Det ødelægger fiskens beskyttende slimlag og giver svampeinfektioner.
              </Text>
            </View>

            {/* Step 2 */}
            <View style={[styles.stepCard, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC' }]}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Afkrog i Vandet</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Brug en pean/krogløsertang eller knudeløst gumminet. Hold fisken under vandet, mens krogen løsnes.
              </Text>
            </View>

            {/* Step 3 */}
            <View style={[styles.stepCard, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC' }]}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNum}>3</Text>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Genopliv Mod Strømmen</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Støt fisken under bugen og hold den vendt mod strømmen eller bevæg den roligt frem og tilbage, så der kommer iltet vand gennem gællerne. Slip først, når den selv slår med halen!
              </Text>
            </View>

            <View style={{ height: 24 }} />
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  timerNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  timerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '800',
    fontSize: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
