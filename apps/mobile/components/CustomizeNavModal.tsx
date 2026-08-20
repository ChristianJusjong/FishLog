import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useNavConfig, ALL_NAV_ITEMS, NavItemDef } from '../contexts/NavConfigContext';

export default function CustomizeNavModal() {
  const { colors, isDark } = useTheme();
  const { selectedRoutes, setSelectedRoutes, resetToDefault, isModalOpen, setIsModalOpen, getNavItem } = useNavConfig();
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedRoutes);

  useEffect(() => {
    if (isModalOpen) {
      setCurrentSelection(selectedRoutes);
    }
  }, [isModalOpen, selectedRoutes]);

  const handleToggleItem = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (currentSelection.includes(route)) {
      if (currentSelection.length <= 4) {
        // Can't have fewer than 4 items to maintain layout balance
        Alert.alert('Bemærk', 'Du skal vælge præcis 4 genveje til menulinjen.');
        return;
      }
      setCurrentSelection(currentSelection.filter((r) => r !== route));
    } else {
      if (currentSelection.length >= 4) {
        // Replace last item or notify
        Alert.alert('Maksimum nået', 'Fravælg først en af de eksisterende 4 genveje for at tilføje denne.');
        return;
      }
      setCurrentSelection([...currentSelection, route]);
    }
  };

  const handleSave = async () => {
    if (currentSelection.length !== 4) {
      Alert.alert('Vælg 4 genveje', 'Vælg venligst præcis 4 genveje før du gemmer.');
      return;
    }
    await setSelectedRoutes(currentSelection);
    setIsModalOpen(false);
  };

  const handleReset = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await resetToDefault();
    setIsModalOpen(false);
  };

  return (
    <Modal
      visible={isModalOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.iconHeaderBadge, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="options" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Tilpas Menulinje</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Vælg dine 4 foretrukne genveje
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Live Preview Bar */}
          <View style={[styles.previewSection, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>LIVE PREVIEW AF DIN BUNDBAR</Text>
            <View style={[styles.previewBar, { backgroundColor: isDark ? '#0A2540' : '#FFFFFF', borderColor: colors.border }]}>
              {/* Slot 1 & 2 */}
              {currentSelection.slice(0, 2).map((route, i) => {
                const item = getNavItem(route);
                return (
                  <View key={`slot-${i}`} style={styles.previewSlot}>
                    <Ionicons name={item.iconActive} size={20} color={colors.accent} />
                    <Text style={[styles.previewSlotText, { color: colors.text }]}>{item.label}</Text>
                  </View>
                );
              })}

              {/* Center Hook Emblem */}
              <View style={styles.previewCenterHook}>
                <LinearGradient
                  colors={[colors.accent, colors.accentDark || '#D4880F']}
                  style={styles.previewCenterGradient}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Slot 3 & 4 */}
              {currentSelection.slice(2, 4).map((route, i) => {
                const item = getNavItem(route);
                return (
                  <View key={`slot-${i + 2}`} style={styles.previewSlot}>
                    <Ionicons name={item.iconActive} size={20} color={colors.accent} />
                    <Text style={[styles.previewSlotText, { color: colors.text }]}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Selection List */}
          <ScrollView style={styles.listBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
              Vælg 4 genveje ({currentSelection.length}/4 valgt)
            </Text>

            {ALL_NAV_ITEMS.map((item) => {
              const isSelected = currentSelection.includes(item.route);
              const selectedIndex = currentSelection.indexOf(item.route) + 1;

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.itemRow,
                    {
                      backgroundColor: isSelected ? colors.accent + '12' : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => handleToggleItem(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                    <View
                      style={[
                        styles.itemIconContainer,
                        { backgroundColor: isSelected ? colors.accent : colors.backgroundLight },
                      ]}
                    >
                      <Ionicons
                        name={isSelected ? item.iconActive : item.iconInactive}
                        size={22}
                        color={isSelected ? '#FFFFFF' : colors.iconDefault}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>

                  {/* Selection Badge / Checkbox */}
                  <View
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: isSelected ? colors.accent : 'transparent',
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {isSelected ? (
                      <Text style={styles.slotNumberText}>{selectedIndex}</Text>
                    ) : (
                      <Ionicons name="add" size={16} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Standard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark || '#D4880F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveBtnGradient}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Gem Menulinje</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    minHeight: 480,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  iconHeaderBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
  previewSection: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  previewSlotText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  previewCenterHook: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  previewCenterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  itemIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resetBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
