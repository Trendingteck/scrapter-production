import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Interface for user profile configuration
export interface UserProfile {
  userId: string;
}

export type UserStorage = BaseStorage<UserProfile> & {
  createProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getProfile: () => Promise<UserProfile>;
  getUserId: () => Promise<string>;
};

// Default profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  userId: 'unknown',
};

const storage = createStorage<UserProfile>('user-profile', DEFAULT_USER_PROFILE, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const userStore: UserStorage = Object.assign(storage, {
  async createProfile(profile: Partial<UserProfile>) {
    const fullProfile = {
      ...DEFAULT_USER_PROFILE,
      ...profile,
    };
    await storage.set(fullProfile);
  },

  async updateProfile(profile: Partial<UserProfile>) {
    const currentProfile = await storage.get();
    await storage.set({
      ...currentProfile,
      ...profile,
    });
  },
  async getProfile() {
    return await storage.get();
  },
  async getUserId() {
    const profile = await storage.get();
    if (!profile.userId || profile.userId === 'unknown') {
      const newUserId = crypto.randomUUID();
      const updated = { ...profile, userId: newUserId };
      await storage.set(updated);
      return newUserId;
    }
    return profile.userId;
  },
}) as UserStorage;
