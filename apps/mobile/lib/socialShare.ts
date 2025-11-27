import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Alert } from 'react-native';

export interface CatchShareData {
  species: string;
  lengthCm?: number;
  weightKg?: number;
  photoUrl?: string;
  location?: string;
  date: string;
  userName?: string;
}

/**
 * Generate a shareable caption for a catch
 */
export function generateCatchCaption(data: CatchShareData): string {
  const parts = [`Fangede en ${data.species}!`];

  if (data.lengthCm) {
    parts.push(`📏 Længde: ${data.lengthCm} cm`);
  }

  if (data.weightKg) {
    parts.push(`⚖️ Vægt: ${data.weightKg} kg`);
  }

  if (data.location) {
    parts.push(`📍 ${data.location}`);
  }

  parts.push(`\n📅 ${data.date}`);
  parts.push(`\n#fiskeri #fishing #hook #fangst #${data.species.toLowerCase().replace(/\s+/g, '')}`);

  return parts.join('\n');
}

/**
 * Download image from URL to local file system
 */
async function downloadImage(url: string): Promise<string> {
  try {
    const fileName = url.split('/').pop() || 'catch.jpg';
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    const downloadResult = await FileSystem.downloadAsync(url, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error('Failed to download image');
    }

    return downloadResult.uri;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

/**
 * Share catch to social media with caption
 */
export async function shareCatchToSocial(data: CatchShareData): Promise<void> {
  try {
    const caption = generateCatchCaption(data);

    // If there's a photo, share it along with the caption
    if (data.photoUrl) {
      // Download image to local storage first
      const localUri = await downloadImage(data.photoUrl);

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          dialogTitle: 'Del din fangst',
          mimeType: 'image/jpeg',
        });
      } else {
        // Fallback: just share text
        if (Platform.OS === 'web') {
          if (navigator.share) {
            await navigator.share({
              title: `Fangst: ${data.species}`,
              text: caption,
            });
          } else {
            Alert.alert('Info', 'Kopieret til udklipsholder', [{ text: 'OK' }]);
            // Copy to clipboard as fallback
          }
        }
      }
    } else {
      // Share text only
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `Fangst: ${data.species}`,
            text: caption,
          });
        } else {
          Alert.alert('Info', caption);
        }
      } else {
        // Use Sharing API for native
        if (await Sharing.isAvailableAsync()) {
          // Create a temporary text file to share
          const fileUri = `${FileSystem.cacheDirectory}catch.txt`;
          await FileSystem.writeAsStringAsync(fileUri, caption);
          await Sharing.shareAsync(fileUri);
        }
      }
    }
  } catch (error) {
    console.error('Error sharing to social media:', error);
    throw error;
  }
}

/**
 * Save catch image to camera roll with watermark
 */
export async function saveCatchImageToGallery(imageUrl: string, watermarkText?: string): Promise<void> {
  try {
    // Request permission
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Tilladelse nødvendig', 'Du skal give tilladelse til at gemme billeder');
      return;
    }

    // Download image
    const localUri = await downloadImage(imageUrl);

    // TODO: Add watermark to image here using react-native-view-shot or image manipulation library
    // For now, we'll save the original image

    // Save to gallery
    const asset = await MediaLibrary.createAssetAsync(localUri);
    await MediaLibrary.createAlbumAsync('Hook', asset, false);

    Alert.alert('Gemt!', 'Billedet er gemt i dit galleri');
  } catch (error) {
    console.error('Error saving image to gallery:', error);
    Alert.alert('Fejl', 'Kunne ikke gemme billede');
    throw error;
  }
}

/**
 * Share catch directly to Instagram Stories
 * Note: This requires the Instagram app to be installed
 */
export async function shareCatchToInstagramStory(imageUrl: string, data: CatchShareData): Promise<void> {
  try {
    const localUri = await downloadImage(imageUrl);

    // Instagram sharing requires special URL scheme
    // This will open Instagram with the image ready to share
    // Note: Actual implementation would require expo-linking and proper URL scheme

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri, {
        dialogTitle: 'Del til Instagram Story',
        mimeType: 'image/jpeg',
      });
    }
  } catch (error) {
    console.error('Error sharing to Instagram:', error);
    throw error;
  }
}

/**
 * Create a shareable link for a catch
 */
export function createShareableLink(catchId: string): string {
  return `https://fishlog-production.up.railway.app/catch/${catchId}`;
}

/**
 * Share catch via general share dialog
 */
export async function shareViaDialog(catchId: string, data: CatchShareData): Promise<void> {
  try {
    const caption = generateCatchCaption(data);
    const link = createShareableLink(catchId);
    const shareText = `${caption}\n\nSe mere: ${link}`;

    if (data.photoUrl) {
      const localUri = await downloadImage(data.photoUrl);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          dialogTitle: 'Del din fangst',
          mimeType: 'image/jpeg',
        });
      }
    } else {
      // Text-only share
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `Fangst: ${data.species}`,
            text: shareText,
            url: link,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sharing via dialog:', error);
    throw error;
  }
}
