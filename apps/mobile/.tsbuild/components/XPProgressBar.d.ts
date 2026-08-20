import React from 'react';
interface Rank {
    title: string;
    icon: string;
    color: string;
}
interface XPProgressBarProps {
    level: number;
    currentLevelXP: number;
    xpForNextLevel: number;
    rank: Rank;
    compact?: boolean;
}
export default function XPProgressBar({ level, currentLevelXP, xpForNextLevel, rank, compact, }: XPProgressBarProps): React.JSX.Element;
export {};
//# sourceMappingURL=XPProgressBar.d.ts.map