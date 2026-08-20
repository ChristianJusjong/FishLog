import React from 'react';
interface NativeAdProps {
    ad: {
        id: string;
        type: string;
        title: string;
        description?: string;
        imageUrl?: string;
        callToAction: string;
        targetUrl: string;
        sponsorName: string;
        sponsorLogo?: string;
    };
    userId: string;
    onImpression?: (adId: string) => void;
    onClick?: (adId: string) => void;
}
export default function NativeAdCard({ ad, userId, onImpression, onClick }: NativeAdProps): React.JSX.Element;
export {};
//# sourceMappingURL=NativeAdCard.d.ts.map