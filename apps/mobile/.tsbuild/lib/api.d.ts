export declare const api: import("axios").AxiosInstance;
export declare const authService: {
    getProfile: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateProfile: (data: {
        name?: string;
        avatar?: string;
        groqApiKey?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    logout: () => Promise<void>;
};
//# sourceMappingURL=api.d.ts.map