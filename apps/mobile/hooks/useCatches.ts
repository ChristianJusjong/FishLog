import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { API_URL } from '@/config/api';

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
    released?: boolean;
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

export const feedCatchesKeys = {
    all: ['feedCatches'] as const,
    infinite: () => [...feedCatchesKeys.all, 'infinite'] as const,
};

export const useCatchesFeed = () => {
    return useInfiniteQuery({
        queryKey: feedCatchesKeys.infinite(),
        queryFn: async ({ pageParam = 1 }): Promise<CatchesResponse> => {
            const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);

            if (!accessToken) {
                throw new Error("No access token found");
            }

            const response = await fetch(`${API_URL}/feed?page=${pageParam}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }

            const data = await response.json();

            const catches = data.catches || data;
            const hasMore = data.hasMore !== undefined ? data.hasMore : catches.length >= 20;

            return { catches, hasMore };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            // If we have more items, next page is current pages count + 1
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
    });
};

export const useToggleLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catchId, isLikedByMe }: { catchId: string; isLikedByMe: boolean }) => {
            const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
            const method = isLikedByMe ? 'DELETE' : 'POST';
            const response = await fetch(`${API_URL}/catches/${catchId}/like`, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Status: ${response.status}`);
            }
            return { catchId, isLikedByMe };
        },
        onMutate: async ({ catchId, isLikedByMe }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: feedCatchesKeys.infinite() });

            // Snapshot the previous value
            const previousFeed = queryClient.getQueryData(feedCatchesKeys.infinite());

            // Optimistically update to the new value
            queryClient.setQueryData(feedCatchesKeys.infinite(), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        catches: page.catches.map((c: FeedCatch) =>
                            c.id === catchId
                                ? {
                                    ...c,
                                    isLikedByMe: !isLikedByMe,
                                    likesCount: isLikedByMe ? c.likesCount - 1 : c.likesCount + 1,
                                }
                                : c
                        ),
                    })),
                };
            });

            // Return a context object with the snapshotted value
            return { previousFeed };
        },
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        onError: (err, newLike, context) => {
            queryClient.setQueryData(feedCatchesKeys.infinite(), context?.previousFeed);
        },
        // Always refetch after error or success:
        onSettled: () => {
            // We don't necessarily need to refetch immediately to save bandwidth, 
            // but uncomment below if strict server sync is desired.
            // queryClient.invalidateQueries({ queryKey: feedCatchesKeys.infinite() })
        },
    });
};

export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catchId, text }: { catchId: string; text: string }) => {
            const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);

            const response = await fetch(`${API_URL}/catches/${catchId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Status: ${response.status}`);
            }

            return await response.json(); // returns the new comment
        },
        onSuccess: (newComment, variables) => {
            // Manually update the cache with the new comment
            queryClient.setQueryData(feedCatchesKeys.infinite(), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        catches: page.catches.map((c: FeedCatch) =>
                            c.id === variables.catchId
                                ? {
                                    ...c,
                                    commentsCount: c.commentsCount + 1,
                                    comments: [...(c.comments || []), newComment]
                                }
                                : c
                        ),
                    })),
                };
            });
        },
    });
};
