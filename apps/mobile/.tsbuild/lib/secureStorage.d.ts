export declare const TOKEN_KEYS: {
    readonly ACCESS_TOKEN: "accessToken";
    readonly REFRESH_TOKEN: "refreshToken";
};
export declare function setSecureItem(key: string, value: string): Promise<void>;
export declare function getSecureItem(key: string): Promise<string | null>;
export declare function deleteSecureItem(key: string): Promise<void>;
export declare function setTokens(accessToken: string, refreshToken: string): Promise<void>;
export declare function getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
}>;
export declare function clearTokens(): Promise<void>;
//# sourceMappingURL=secureStorage.d.ts.map