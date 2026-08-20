import React from 'react';
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
    premium?: boolean;
    groqApiKey?: string;
    userId?: string;
}
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    token: string | null;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    getAuthHeader: () => Promise<{
        Authorization: string;
    } | {}>;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare const useAuth: () => AuthContextType;
//# sourceMappingURL=AuthContext.d.ts.map