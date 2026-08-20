import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Haptics from 'expo-haptics';
import { Logo } from './Logo';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);
const STORY_CARD_HEIGHT = STORY_CARD_WIDTH * (16 / 9);

interface StoryCatchData {
  species: string;
  weight?: number;
  length?: number;
  locationName?: string;
  waterType?: string;
  baitUsed?: string;
  date: string;
  photoUrl?: string;
  released?: boolean;
  anglerName?: string;
}

interface StoryCardModalProps {
  visible: boolean;
  onClose: () => void;
  catchData: StoryCatchData;
}

export default function StoryCardModal({ visible, onClose, catchData }: StoryCardModalProps) {
  const { colors } = useTheme();
  const [sharing, setSharing] = useState(false);

  const handleShareStory = async () => {
    try {
      setSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      // Build HTML render of the Story card
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
            body {
              background: #000;
              width: 1080px;
              height: 1920px;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            .story-card {
              position: relative;
              width: 1080px;
              height: 1920px;
              background: #0A1E34;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 90px 70px;
              color: #FFFFFF;
            }
            .bg-img {
              position: absolute;
              top: 0;
              left: 0;
              width: 1080px;
              height: 1920px;
              object-fit: cover;
              z-index: 1;
            }
            .gradient-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 1080px;
              height: 1920px;
              background: linear-gradient(180deg, rgba(7,21,36,0.65) 0%, rgba(7,21,36,0.2) 40%, rgba(7,21,36,0.85) 75%, rgba(7,21,36,0.98) 100%);
              z-index: 2;
            }
            .content {
              position: relative;
              z-index: 3;
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: space-between;
            }
            .top-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-pill {
              background: rgba(245, 166, 35, 0.2);
              border: 2px solid #F5A623;
              padding: 16px 36px;
              border-radius: 40px;
              font-weight: 800;
              font-size: 28px;
              color: #F5A623;
              letter-spacing: 2px;
            }
            .cr-pill {
              background: ${catchData.released ? '#10B981' : '#F5A623'};
              color: #FFFFFF;
              font-weight: 800;
              font-size: 26px;
              padding: 16px 32px;
              border-radius: 40px;
            }
            .bottom-info {
              display: flex;
              flex-direction: column;
              gap: 30px;
            }
            .species-title {
              font-size: 82px;
              font-weight: 900;
              line-height: 90px;
              text-shadow: 0 4px 20px rgba(0,0,0,0.8);
            }
            .stats-grid {
              display: flex;
              gap: 20px;
            }
            .stat-pill {
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(20px);
              border: 2px solid rgba(255,255,255,0.3);
              padding: 24px 36px;
              border-radius: 28px;
              display: flex;
              flex-direction: column;
            }
            .stat-val {
              font-size: 54px;
              font-weight: 900;
              color: #00D4B2;
            }
            .stat-lbl {
              font-size: 24px;
              font-weight: 700;
              color: #E2E8F0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-row {
              font-size: 32px;
              color: #CBD5E1;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 16px;
            }
          </style>
        </head>
        <body>
          <div class="story-card">
            ${catchData.photoUrl ? `<img class="bg-img" src="${catchData.photoUrl}" />` : ''}
            <div class="gradient-overlay"></div>
            <div class="content">
              <div class="top-bar">
                <div class="brand-pill">HOOK • CATCH LOG</div>
                <div class="cr-pill">${catchData.released ? 'GENUDSAT (C&R) 🌿' : 'HJEMTAGET 🍽️'}</div>
              </div>
              <div class="bottom-info">
                <div class="meta-row">📍 ${catchData.locationName || 'Danmark'} • 📅 ${catchData.date}</div>
                <div class="species-title">${catchData.species}</div>
                <div class="stats-grid">
                  ${catchData.weight ? `<div class="stat-pill"><span class="stat-val">${catchData.weight} kg</span><span class="stat-lbl">Vægt</span></div>` : ''}
                  ${catchData.length ? `<div class="stat-pill"><span class="stat-val">${catchData.length} cm</span><span class="stat-lbl">Længde</span></div>` : ''}
                  ${catchData.baitUsed ? `<div class="stat-pill"><span class="stat-val">${catchData.baitUsed}</span><span class="stat-lbl">Agn</span></div>` : ''}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
        width: 1080,
        height: 1920,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: 'public.jpeg',
          mimeType: 'image/jpeg',
          dialogTitle: `Del ${catchData.species} Story`,
        });
      } else {
        Alert.alert('Deling', 'Deling er ikke tilgængelig på denne enhed.');
      }
    } catch (e: any) {
      console.error('Story share error:', e);
      Alert.alert('Fejl ved deling', e?.message || 'Kunne ikke generere Story Card.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Del som Story (9:16)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* 9:16 Story Card Preview */}
          <View style={[styles.storyCard, { width: STORY_CARD_WIDTH, height: STORY_CARD_HEIGHT }]}>
            {catchData.photoUrl ? (
              <Image source={{ uri: catchData.photoUrl }} style={styles.bgImage} contentFit="cover" />
            ) : (
              <View style={[styles.bgImage, { backgroundColor: '#0A2540' }]} />
            )}

            <LinearGradient
              colors={['rgba(10,37,64,0.6)', 'rgba(10,37,64,0.1)', 'rgba(7,21,36,0.92)']}
              style={styles.storyGradient}
            >
              {/* Top Row */}
              <View style={styles.storyTopRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>HOOK • STORY</Text>
                </View>
                <View style={[styles.crBadge, { backgroundColor: catchData.released ? '#10B981' : '#F5A623' }]}>
                  <Text style={styles.crBadgeText}>{catchData.released ? 'Genudsat 🌿' : 'Hjemtaget 🍽️'}</Text>
                </View>
              </View>

              {/* Bottom Catch Info */}
              <View style={styles.storyBottomInfo}>
                <Text style={styles.locationDateText}>
                  📍 {catchData.locationName || 'Danmark'} • {catchData.date}
                </Text>
                <Text style={styles.speciesNameText}>{catchData.species}</Text>

                <View style={styles.statsPillRow}>
                  {catchData.weight !== undefined && (
                    <View style={styles.statPill}>
                      <Text style={styles.statPillValue}>{catchData.weight} kg</Text>
                      <Text style={styles.statPillLabel}>VÆGT</Text>
                    </View>
                  )}
                  {catchData.length !== undefined && (
                    <View style={styles.statPill}>
                      <Text style={styles.statPillValue}>{catchData.length} cm</Text>
                      <Text style={styles.statPillLabel}>LÆNGDE</Text>
                    </View>
                  )}
                  {catchData.baitUsed && (
                    <View style={styles.statPill}>
                      <Text style={styles.statPillValue} numberOfLines={1}>{catchData.baitUsed}</Text>
                      <Text style={styles.statPillLabel}>AGN</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareStory}
            disabled={sharing}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#E1306C', '#F77737', '#FCAF45']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareGradient}
            >
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="logo-instagram" size={22} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Del til Instagram / Facebook</Text>
                </>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: STORY_CARD_WIDTH,
    marginBottom: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  storyCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  storyGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  storyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.25)',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  brandBadgeText: {
    color: '#F5A623',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  crBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  crBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  storyBottomInfo: {
    gap: 8,
  },
  locationDateText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  speciesNameText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  statsPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
  },
  statPillValue: {
    color: '#00D4B2',
    fontSize: 15,
    fontWeight: '900',
  },
  statPillLabel: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareBtn: {
    width: STORY_CARD_WIDTH,
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
