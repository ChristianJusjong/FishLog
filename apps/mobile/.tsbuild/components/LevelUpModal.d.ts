import React from 'react';
interface Rank {
    title: string;
    icon: string;
    color: string;
    description: string;
}
interface LevelUpModalProps {
    visible: boolean;
    newLevel: number;
    rank: Rank;
    rewards?: string[];
    onClose: () => void;
}
export default function LevelUpModal({ visible, newLevel, rank, rewards, onClose, }: LevelUpModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=LevelUpModal.d.ts.map