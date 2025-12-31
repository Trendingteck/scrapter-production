export type { BaseStorage } from './base/types';
export * from './settings';
export * from './chat';
export { userStore, DEFAULT_USER_PROFILE } from './profile';
export type { UserStorage } from './profile';
export * from './prompt/favorites';
export { apiRequest } from './base/apiClient';

// Re-export the favorites instance for direct use
export { default as favoritesStorage } from './prompt/favorites';
