import React from 'react';
interface BadgeUnlockModalProps {
    visible: boolean;
    badge: {
        icon: string;
        name: string;
        description: string;
        tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
    } | null;
    onClose: () => void;
}
export default function BadgeUnlockModal({ visible, badge, onClose }: BadgeUnlockModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=BadgeUnlockModal.d.ts.map