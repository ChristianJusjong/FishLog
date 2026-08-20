export interface User {
    id: string;
    name: string;
    avatar?: string;
}
export interface Comment {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
    user: User;
}
export interface FeedCatch {
    id: string;
    species: string;
    lengthCm?: number;
    weightKg?: number;
    bait?: string;
    rig?: string;
    technique?: string;
    notes?: string;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    user: User;
    likesCount: number;
    commentsCount: number;
    isLikedByMe: boolean;
    comments: Comment[];
}
export interface CatchesResponse {
    catches: FeedCatch[];
    hasMore: boolean;
}
export declare const feedCatchesKeys: {
    all: readonly ["feedCatches"];
    infinite: () => readonly ["feedCatches", "infinite"];
};
export declare const useCatchesFeed: () => import("@tanstack/react-query").UseInfiniteQueryResult<import("@tanstack/query-core").InfiniteData<CatchesResponse, unknown>, Error>;
export declare const useToggleLike: () => import("@tanstack/react-query").UseMutationResult<{
    catchId: string;
    isLikedByMe: boolean;
}, Error, {
    catchId: string;
    isLikedByMe: boolean;
}, {
    previousFeed: unknown;
}>;
export declare const useAddComment: () => import("@tanstack/react-query").UseMutationResult<any, Error, {
    catchId: string;
    text: string;
}, unknown>;
//# sourceMappingURL=useCatches.d.ts.map