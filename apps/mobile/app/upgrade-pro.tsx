import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageLayout from '../components/PageLayout';

export default function UpgradeProScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { isPro, upgradeToPro, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLoading(true);
    const success = await upgradeToPro(selectedPlan);
    setLoading(false);

    if (success) {
      Alert.alert(
        'Velkommen til Hook Pro! 👑',
        'Du har nu 100% annoncefri oplevelse, adgang til dybdekort og ubegrænset Fiske-AI.',
        [{ text: 'Kanon!', onPress: () => router.back() }]
      );
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const hasPro = await restorePurchases();
    if (hasPro) {
      Alert.alert('Gendannet!', 'Dit Hook Pro abonnement er aktivt.');
    } else {
      Alert.alert('Intet abonnement fundet', 'Der blev ikke fundet et aktivt abonnement tilknyttet denne konto.');
    }
  };

  const FEATURES = [
    { icon: 'ban', title: '100% Annoncefri', desc: 'Ingen sponsorerede opslag eller reklamer i feedet.' },
    { icon: 'sparkles', title: 'Ubegrænset Fiske-AI', desc: 'Daglige dybdeanalyser, artsscanning og spot-taktik.' },
    { icon: 'map', title: 'Offline Dybdekort', desc: 'Download sø- og kystkort til 0-dæknings områder.' },
    { icon: 'ribbon', title: 'Pro Guld-Emblem', desc: 'Få det gyldne Pro-badge på alle dine fangster i feedet.' },
  ];

  return (
    <PageLayout>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isDark ? '#05111D' : '#F8FAFC' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.restoreText, { color: colors.textSecondary }]}>Gendan køb</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Pro Hero Crown */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#F5A623', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.crownCircle}
            >
              <Ionicons name="trophy" size={32} color="#071524" />
            </LinearGradient>
            <Text style={[styles.heroTitle, { color: colors.text }]}>HOOK PRO</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Den ultimative kyst- og fiskepakke til den dedikerede lystfisker
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  { backgroundColor: isDark ? '#0A1E34' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
                ]}
              >
                <View style={styles.featureIconCircle}>
                  <Ionicons name={f.icon as any} size={20} color="#00D4B2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing Options */}
          <View style={styles.pricingSection}>
            {/* Yearly (Best Value) */}
            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: isDark ? '#0A1E34' : '#FFFFFF',
                  borderColor: selectedPlan === 'yearly' ? '#00D4B2' : colors.border,
                  borderWidth: selectedPlan === 'yearly' ? 2 : 1,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedPlan('yearly');
              }}
              activeOpacity={0.85}
            >
              <View style={styles.badgeBest}>
                <Text style={styles.badgeBestText}>SPAR 28% • 7 DAGES GRATIS PRØVE</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.text }]}>Årligt Abonnement</Text>
                  <Text style={[styles.planSubtitle, { color: colors.textSecondary }]}>Kun 20,75 kr / md (faktureres 249 kr/år)</Text>
                </View>
                <Ionicons
                  name={selectedPlan === 'yearly' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedPlan === 'yearly' ? '#00D4B2' : colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {/* Monthly */}
            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: isDark ? '#0A1E34' : '#FFFFFF',
                  borderColor: selectedPlan === 'monthly' ? '#00D4B2' : colors.border,
                  borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedPlan('monthly');
              }}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.text }]}>Månedligt Abonnement</Text>
                  <Text style={[styles.planSubtitle, { color: colors.textSecondary }]}>29 kr / måned (ingen binding)</Text>
                </View>
                <Ionicons
                  name={selectedPlan === 'monthly' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedPlan === 'monthly' ? '#00D4B2' : colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D4B2', '#009688']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeGradient}
            >
              <Text style={styles.subscribeBtnText}>
                {loading ? 'Behandler...' : isPro ? 'Du er Hook Pro Medlem 👑' : 'Start 7 Dages Gratis Prøve'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#071524" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            Abonnementet fornyes automatisk, medmindre det opsiges senest 24 timer før periodens udløb. Ingen binding.
          </Text>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  crownCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  featuresSection: {
    gap: 10,
    marginVertical: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 212, 178, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  pricingSection: {
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 18,
    position: 'relative',
  },
  badgeBest: {
    alignSelf: 'flex-start',
    backgroundColor: '#00D4B2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeBestText: {
    color: '#071524',
    fontSize: 10,
    fontWeight: '900',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  planSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  subscribeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeBtnText: {
    color: '#071524',
    fontSize: 15,
    fontWeight: '900',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
