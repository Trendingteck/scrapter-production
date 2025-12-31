import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    credits?: number; // Optional: for display purposes
}

export interface UsageStats {
    requestsThisMonth: number;
    tokensUsed: number;
}

export interface AuthState {
    sessionToken: string | null;
    userProfile: UserProfile | null;
    usageStats: UsageStats | null;
}

export type AuthStorage = BaseStorage<AuthState> & {
    setSession: (token: string, profile: UserProfile) => Promise<void>;
    clearSession: () => Promise<void>;
    updateUsage: (stats: UsageStats) => Promise<void>;
};

const storage = createStorage<AuthState>(
    'auth-state',
    {
        sessionToken: null,
        userProfile: null,
        usageStats: null,
    },
    {
        storageEnum: StorageEnum.Local, // Persist across browser restarts
        liveUpdate: true,
    },
);

export const authStore: AuthStorage = Object.assign(storage, {
    async setSession(token: string, profile: UserProfile) {
        await storage.set({
            sessionToken: token,
            userProfile: profile,
            usageStats: { requestsThisMonth: 0, tokensUsed: 0 },
        });
    },
    async clearSession() {
        await storage.set({
            sessionToken: null,
            userProfile: null,
            usageStats: null,
        });
    },
    async updateUsage(stats: UsageStats) {
        const current = await storage.get();
        await storage.set({
            ...current,
            usageStats: stats,
        });
    },
}) as AuthStorage;
