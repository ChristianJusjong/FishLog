import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { parseVoiceCatchText, ParsedVoiceCatch } from '../lib/voiceCatchParser';
import FishSpeciesIcon from './FishSpeciesIcon';

interface VoiceCatchModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyParsedData: (data: ParsedVoiceCatch) => void;
}

export default function VoiceCatchModal({
  visible,
  onClose,
  onApplyParsedData,
}: VoiceCatchModalProps) {
  const { colors, isDark } = useTheme();
  const [speechText, setSpeechText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const parsedResult = parseVoiceCatchText(speechText);

  const samplePhrases = [
    'Havørred på 54 cm og 1.8 kg taget på pink Sandeel, genudsat',
    'Gedde på 85 cm på Westin Swim, vejede 4.5 kilo',
    'Aborre 38 cm på jig med grøn hale ved sivene',
    'Torsk 62 cm på 3.2 kg taget på pirk',
  ];

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onApplyParsedData(parsedResult);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={50}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.micBadge}>
                <Ionicons name="mic" size={18} color="#00D4B2" />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Håndfri Stemmelogning</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tal eller indtast hvad du fangede (art, vægt, længde, agn og C&R):
          </Text>

          {/* Text Input / Transcription Preview */}
          <View style={[styles.inputBox, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="F.eks: Havørred på 52 cm og 1.6 kg på pink sandeel, genudsat..."
              placeholderTextColor={colors.textSecondary}
              value={speechText}
              onChangeText={setSpeechText}
              multiline
              numberOfLines={3}
            />
            {speechText.length > 0 && (
              <TouchableOpacity onPress={() => setSpeechText('')} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Preset Phrases */}
          <View style={styles.presetsContainer}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 }}>
              PRØV ET EKSEMPEL:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {samplePhrases.map((phrase, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.presetChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSpeechText(phrase);
                  }}
                >
                  <Text style={[styles.presetChipText, { color: colors.accent }]} numberOfLines={1}>
                    "{phrase.slice(0, 28)}..."
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Live AI Parsed Data Preview */}
          {parsedResult.confidence > 0 && (
            <View style={[styles.parsedCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="sparkles" size={16} color={colors.accent} />
                <Text style={[styles.parsedCardTitle, { color: colors.accent }]}>Genkendte Fangstdata:</Text>
              </View>

              <View style={styles.parsedPillsRow}>
                {parsedResult.species && (
                  <View style={[styles.parsedPill, { backgroundColor: colors.surface }]}>
                    <FishSpeciesIcon speciesId={parsedResult.species} size={18} color={colors.accent} />
                    <Text style={[styles.parsedPillText, { color: colors.text }]}>{parsedResult.species}</Text>
                  </View>
                )}
                {parsedResult.lengthCm && (
                  <View style={[styles.parsedPill, { backgroundColor: colors.surface }]}>
                    <Ionicons name="resize-outline" size={14} color="#00D4B2" />
                    <Text style={[styles.parsedPillText, { color: colors.text }]}>{parsedResult.lengthCm} cm</Text>
                  </View>
                )}
                {parsedResult.weightKg && (
                  <View style={[styles.parsedPill, { backgroundColor: colors.surface }]}>
                    <Ionicons name="scale-outline" size={14} color="#F5A623" />
                    <Text style={[styles.parsedPillText, { color: colors.text }]}>{parsedResult.weightKg} kg</Text>
                  </View>
                )}
                {parsedResult.bait && (
                  <View style={[styles.parsedPill, { backgroundColor: colors.surface }]}>
                    <Ionicons name="flash-outline" size={14} color="#F5A623" />
                    <Text style={[styles.parsedPillText, { color: colors.text }]}>{parsedResult.bait}</Text>
                  </View>
                )}
                {parsedResult.released !== undefined && (
                  <View style={[styles.parsedPill, { backgroundColor: colors.surface }]}>
                    <Ionicons name="leaf-outline" size={14} color="#10B981" />
                    <Text style={[styles.parsedPillText, { color: '#10B981', fontWeight: '800' }]}>
                      {parsedResult.released ? 'Genudsat (C&R)' : 'Hjemtaget'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.applyBtn, { opacity: parsedResult.confidence > 0 ? 1 : 0.4 }]}
            onPress={handleApply}
            disabled={parsedResult.confidence === 0}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark || '#D4880F']}
              style={styles.applyBtnGradient}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Udfyld Fangstformular</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  micBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  presetsContainer: {
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  parsedCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  parsedCardTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  parsedPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  parsedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  parsedPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  applyBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  applyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
