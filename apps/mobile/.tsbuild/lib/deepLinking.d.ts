export interface DeepLinkParams {
    path: string;
    params?: Record<string, string>;
}
/**
 * Parse a deep link URL and extract the path and params
 */
export declare function parseDeepLink(url: string): DeepLinkParams | null;
/**
 * Handle a deep link by navigating to the appropriate screen
 */
export declare function handleDeepLink(url: string): boolean;
/**
 * Initialize deep link listener
 * Returns a cleanup function
 */
export declare function initDeepLinking(): () => void;
/**
 * Create a shareable deep link URL
 */
export declare function createDeepLink(type: string, id?: string, params?: Record<string, string>): string;
/**
 * Create shareable deep links for different entities
 */
export declare const deepLinks: {
    catch: (id: string) => string;
    challenge: (id: string) => string;
    event: (id: string) => string;
    group: (id: string) => string;
    profile: (userId: string) => string;
    feed: () => string;
    catches: () => string;
    map: () => string;
    statistics: () => string;
};
//# sourceMappingURL=deepLinking.d.ts.map