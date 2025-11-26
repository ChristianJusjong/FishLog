import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface ReportContentModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: 'catch' | 'comment' | 'user' | 'group_post' | 'group_message';
  contentId: string;
  contentTitle?: string; // Optional title to show what's being reported
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

const SHADOWS = {
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

const REPORT_CATEGORIES = [
  { value: 'spam', label: 'Spam', icon: 'mail-outline', description: 'Uønsket reklame eller gentagne opslag' },
  { value: 'inappropriate', label: 'Upassende', icon: 'warning-outline', description: 'Stødende eller upassende indhold' },
  { value: 'harassment', label: 'Chikane', icon: 'sad-outline', description: 'Mobning eller chikane af andre' },
  { value: 'fake', label: 'Falsk', icon: 'close-circle-outline', description: 'Falsk information eller svindel' },
  { value: 'other', label: 'Andet', icon: 'ellipsis-horizontal-outline', description: 'Anden type problem' },
];

export default function ReportContentModal({
  visible,
  onClose,
  contentType,
  contentId,
  contentTitle,
}: ReportContentModalProps) {
  const { colors } = useTheme();
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Vælg kategori', 'Vælg venligst en rapporteringskategori');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId,
          category: selectedCategory,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      Alert.alert(
        'Rapport Indsendt',
        'Tak for din rapport. Vi vil gennemgå den hurtigst muligt.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Fejl',
        error.message || 'Kunne ikke indsende rapport. Prøv igen senere.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="flag" size={24} color={colors.accent} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Rapportér Indhold
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={submitting}>
              <Ionicons name="close" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {contentTitle && (
              <View style={[styles.contentInfo, { backgroundColor: colors.background }]}>
                <Text style={[styles.contentInfoText, { color: colors.textSecondary }]}>
                  Du rapporterer: <Text style={{ color: colors.text }}>{contentTitle}</Text>
                </Text>
              </View>
            )}

            {/* Category Selection */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Vælg kategori
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Hvad er problemet med dette indhold?
            </Text>

            {REPORT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.background },
                  selectedCategory === category.value && {
                    backgroundColor: colors.accent + '20',
                    borderColor: colors.accent,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedCategory(category.value)}
                disabled={submitting}
              >
                <View style={styles.categoryLeft}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={
                      selectedCategory === category.value
                        ? colors.accent
                        : colors.textSecondary
                    }
                  />
                  <View style={styles.categoryTextContainer}>
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color:
                            selectedCategory === category.value
                              ? colors.accent
                              : colors.text,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                    <Text
                      style={[
                        styles.categoryDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {category.description}
                    </Text>
                  </View>
                </View>
                {selectedCategory === category.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                  />
                )}
              </TouchableOpacity>
            ))}

            {/* Additional Details */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.lg }]}>
              Yderligere detaljer (valgfrit)
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Beskriv problemet mere detaljeret
            </Text>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="F.eks. dette opslag indeholder..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.accent}
                style={{ marginRight: SPACING.sm }}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Din rapport vil blive gennemgået af vores team. Vi tager alle rapporter alvorligt.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Annuller
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.accent },
                (!selectedCategory || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedCategory || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="flag" size={20} color={colors.white} />
                  <Text style={[styles.submitButtonText, { color: colors.white }]}>
                    Indsend Rapport
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
  contentInfo: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  contentInfoText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    minHeight: 100,
    marginBottom: SPACING.md,
  },
  infoBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
