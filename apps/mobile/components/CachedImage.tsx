import { Image, ImageProps } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Blurhash placeholder for loading state
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string | undefined | null;
  fallbackUri?: string;
  blurhash?: string;
  showPlaceholder?: boolean;
}

export function CachedImage({
  uri,
  fallbackUri,
  blurhash = DEFAULT_BLURHASH,
  showPlaceholder = true,
  style,
  ...props
}: CachedImageProps) {
  const { colors } = useTheme();

  const source = uri || fallbackUri;

  if (!source) {
    if (showPlaceholder) {
      return (
        <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }, style]} />
      );
    }
    return null;
  }

  return (
    <Image
      source={{ uri: source }}
      placeholder={showPlaceholder ? { blurhash } : undefined}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      style={style}
      {...props}
    />
  );
}

// Avatar component with circular styling
interface AvatarImageProps extends Omit<CachedImageProps, 'style'> {
  size?: number;
}

export function AvatarImage({ size = 40, uri, ...props }: AvatarImageProps) {
  const fallback = 'https://ui-avatars.com/api/?size=' + (size * 2) + '&background=random';
  return (
    <CachedImage
      uri={uri}
      fallbackUri={fallback}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      {...props}
    />
  );
}

// Catch photo component
interface CatchImageProps extends Omit<CachedImageProps, 'style'> {
  aspectRatio?: number;
  borderRadius?: number;
}

export function CatchImage({ 
  uri, 
  aspectRatio = 4/3, 
  borderRadius = 12,
  ...props 
}: CatchImageProps) {
  return (
    <CachedImage
      uri={uri}
      style={{
        width: '100%',
        aspectRatio,
        borderRadius,
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CachedImage;
