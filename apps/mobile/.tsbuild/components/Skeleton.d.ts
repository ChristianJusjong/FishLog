import React from 'react';
import { ViewStyle } from 'react-native';
interface SkeletonProps {
    width?: number | '100%' | '70%' | '50%';
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}
export declare function Skeleton({ width, height, borderRadius, style }: SkeletonProps): React.JSX.Element;
export declare function CatchCardSkeleton(): React.JSX.Element;
export declare function FeedItemSkeleton(): React.JSX.Element;
export declare function ProfileSkeleton(): React.JSX.Element;
export declare function ListSkeleton({ count }: {
    count?: number;
}): React.JSX.Element;
export default Skeleton;
//# sourceMappingURL=Skeleton.d.ts.map