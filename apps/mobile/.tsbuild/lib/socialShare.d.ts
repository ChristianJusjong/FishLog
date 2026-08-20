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
export declare function generateCatchCaption(data: CatchShareData): string;
/**
 * Share catch to social media with caption
 */
export declare function shareCatchToSocial(data: CatchShareData): Promise<void>;
/**
 * Save catch image to camera roll with watermark
 */
export declare function saveCatchImageToGallery(imageUrl: string, watermarkText?: string): Promise<void>;
/**
 * Share catch directly to Instagram Stories
 * Note: This requires the Instagram app to be installed
 */
export declare function shareCatchToInstagramStory(imageUrl: string, data: CatchShareData): Promise<void>;
/**
 * Create a shareable link for a catch
 */
export declare function createShareableLink(catchId: string): string;
/**
 * Share catch via general share dialog
 */
export declare function shareViaDialog(catchId: string, data: CatchShareData): Promise<void>;
//# sourceMappingURL=socialShare.d.ts.map