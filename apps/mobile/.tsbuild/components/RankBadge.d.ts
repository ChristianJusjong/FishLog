import React from 'react';
interface Rank {
    title: string;
    icon: string;
    color: string;
}
interface RankBadgeProps {
    rank: Rank;
    level: number;
    size?: 'small' | 'medium' | 'large';
    showLevel?: boolean;
    style?: any;
}
export default function RankBadge({ rank, level, size, showLevel, style, }: RankBadgeProps): React.JSX.Element;
export {};
//# sourceMappingURL=RankBadge.d.ts.map