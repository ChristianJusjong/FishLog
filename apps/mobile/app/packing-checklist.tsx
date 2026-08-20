import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from '../components/PageLayout';

const CHECKLIST_STORAGE_KEY = '@hook_packing_checklist_v1';

interface ChecklistItem {
  id: string;
  label: string;
  category: 'coastal' | 'boat' | 'safety';
  icon: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Lovpligtigt & Sikkerhed
  { id: 'fisketegn', label: 'Statsligt Lystfisketegn (på mobilen/print)', category: 'safety', icon: 'card' },
  { id: 'tang', label: 'Krogløsertang / Pean (til skånsom afkrogning)', category: 'safety', icon: 'construct' },
  { id: 'malebaand', label: 'Målebånd / Foldemeter (tjek mindstemål)', category: 'safety', icon: 'resize' },
  { id: 'affald', label: 'Affaldspose (efterlad kysten renere)', category: 'safety', icon: 'trash' },

  // Kyst & Vadning
  { id: 'waders', label: 'Waders & vadestøvler', category: 'coastal', icon: 'water' },
  { id: 'wadersbaelte', label: 'Wadersbælte (livsvigtigt mod vandindtrængning)', category: 'coastal', icon: 'shield-checkmark' },
  { id: 'lineklipper', label: 'Lineklipper / Saks', category: 'coastal', icon: 'cut' },
  { id: 'polaroid', label: 'Polaroid solbriller (spot fisk & stenrev)', category: 'coastal', icon: 'glasses' },
  { id: 'forfang', label: 'Ekstra fluorocarbon forfangsline & hægter', category: 'coastal', icon: 'git-commit' },
  { id: 'pandelampe', label: 'Pandelampe med rød natbelysning', category: 'coastal', icon: 'flashlight' },
  { id: 'termokande', label: 'Kaffe / Termokande & snacks', category: 'coastal', icon: 'cafe' },

  // Båd & Trolling
  { id: 'redningsvest', label: 'Redningsvest / Svømmevest (lovkrav)', category: 'boat', icon: 'boat' },
  { id: 'fangstnet', label: 'Knuteløst gummibelagt fangstnet', category: 'boat', icon: 'basket' },
  { id: 'drivanker', label: 'Drivanker (til perfekt driftshastighed)', category: 'boat', icon: 'flag' },
];

export default function PackingChecklistScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSavedState();
  }, []);

  const loadSavedState = async () => {
    try {
      const saved = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleItem = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newState = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(newState);
    await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState));
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Nulstil Tjekliste 🔄',
      'Er du klar til en ny fisketur? Dette rydder alle flueben.',
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Nulstil',
          style: 'destructive',
          onPress: async () => {
            setCheckedIds({});
            await AsyncStorage.removeItem(CHECKLIST_STORAGE_KEY);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          },
        },
      ]
    );
  };

  const totalCount = DEFAULT_ITEMS.length;
  const checkedCount = Object.values(checkedIds).filter(Boolean).length;
  const progressPct = Math.round((checkedCount / totalCount) * 100);

  const renderSection = (category: 'safety' | 'coastal' | 'boat', title: string, icon: string) => {
    const items = DEFAULT_ITEMS.filter((i) => i.category === category);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={18} color="#00D4B2" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        {items.map((item) => {
          const isChecked = !!checkedIds[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: isChecked
                    ? 'rgba(0, 212, 178, 0.12)'
                    : isDark
                    ? '#0A1E34'
                    : '#FFFFFF',
                  borderColor: isChecked ? '#00D4B2' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                },
              ]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={isChecked ? '#00D4B2' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isChecked ? '#00D4B2' : colors.text,
                    textDecorationLine: isChecked ? 'line-through' : 'none',
                    fontWeight: isChecked ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isDark ? '#05111D' : '#F8FAFC' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Kyst-Pakkeliste 🧳</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {checkedCount} af {totalCount} pakket ({progressPct}%)
            </Text>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="refresh" size={18} color="#00D4B2" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {renderSection('safety', 'Lovpligtigt & Fiskevelfærd', 'shield-checkmark')}
          {renderSection('coastal', 'Kyst- & Vadeudstyr', 'water')}
          {renderSection('boat', 'Båd, Kajak & Ekstra', 'boat')}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  progressBarWrapper: {
    height: 4,
    backgroundColor: 'rgba(0, 212, 178, 0.2)',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D4B2',
  },
  scroll: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  itemText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
