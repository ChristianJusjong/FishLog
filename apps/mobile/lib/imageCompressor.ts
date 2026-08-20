import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  originalUri: string;
}

/**
 * Optimizes and compresses a catch photo before offline queuing and uploading.
 * Resizes 4000x3000 (8-12MB) camera photos down to max 1440px (~300-600KB).
 */
export async function compressCatchPhoto(
  uri: string,
  maxWidth = 1440,
  quality = 0.82
): Promise<CompressedImageResult> {
  try {
    if (!uri || uri.startsWith('http://') || uri.startsWith('https://')) {
      return { uri, width: 0, height: 0, originalUri: uri };
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      originalUri: uri,
    };
  } catch (error) {
    console.warn('[ImageCompressor] Fallback to original image:', error);
    return { uri, width: 0, height: 0, originalUri: uri };
  }
}
