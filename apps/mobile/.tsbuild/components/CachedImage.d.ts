import { ImageProps } from 'expo-image';
interface CachedImageProps extends Omit<ImageProps, 'source'> {
    uri: string | undefined | null;
    fallbackUri?: string;
    blurhash?: string;
    showPlaceholder?: boolean;
}
export declare function CachedImage({ uri, fallbackUri, blurhash, showPlaceholder, style, ...props }: CachedImageProps): import("react").JSX.Element | null;
interface AvatarImageProps extends Omit<CachedImageProps, 'style'> {
    size?: number;
}
export declare function AvatarImage({ size, uri, ...props }: AvatarImageProps): import("react").JSX.Element;
interface CatchImageProps extends Omit<CachedImageProps, 'style'> {
    aspectRatio?: number;
    borderRadius?: number;
}
export declare function CatchImage({ uri, aspectRatio, borderRadius, ...props }: CatchImageProps): import("react").JSX.Element;
export default CachedImage;
//# sourceMappingURL=CachedImage.d.ts.map