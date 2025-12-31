import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Interface for firewall settings configuration
export interface FirewallConfig {
  allowList: string[]; // URLs that are explicitly allowed
  denyList: string[]; // URLs that are explicitly denied
  enabled: boolean; // Whether the firewall is enabled
}

/**
 * Normalizes a URL by trimming whitespace and converting to lowercase
 * @param url The URL to normalize
 * @returns The normalized URL
 */
function normalizeUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '');
}

export type FirewallStorage = BaseStorage<FirewallConfig> & {
  updateFirewall: (settings: Partial<FirewallConfig>) => Promise<void>;
  getFirewall: () => Promise<FirewallConfig>;
  resetToDefaults: () => Promise<void>;
  addToAllowList: (url: string) => Promise<void>;
  removeFromAllowList: (url: string) => Promise<void>;
  addToDenyList: (url: string) => Promise<void>;
  removeFromDenyList: (url: string) => Promise<void>;
};

// Default settings
export const DEFAULT_FIREWALL_SETTINGS: FirewallConfig = {
  allowList: [],
  denyList: [],
  enabled: true,
};

const storage = createStorage<FirewallConfig>('firewall-settings', DEFAULT_FIREWALL_SETTINGS, {
  area: 'sync',
  liveUpdate: true,
});

export const firewallStore: FirewallStorage = Object.assign(storage, {
  async updateFirewall(settings: Partial<FirewallConfig>) {
    const currentSettings = await storage.get();
    await storage.set({
      ...(currentSettings || DEFAULT_FIREWALL_SETTINGS),
      ...settings,
    });
  },
  async getFirewall() {
    const settings = await storage.get();
    return settings || DEFAULT_FIREWALL_SETTINGS;
  },
  async resetToDefaults() {
    await storage.set(DEFAULT_FIREWALL_SETTINGS);
  },
  async addToAllowList(url: string) {
    const normalizedUrl = normalizeUrl(url);
    const currentSettings = (await storage.get()) || DEFAULT_FIREWALL_SETTINGS;

    if (!currentSettings.allowList.includes(normalizedUrl)) {
      const denyList = currentSettings.denyList.filter(item => item !== normalizedUrl);
      const updated = {
        ...currentSettings,
        allowList: [...currentSettings.allowList, normalizedUrl],
        denyList,
      };
      await storage.set(updated);
    }
  },
  async removeFromAllowList(url: string) {
    const normalizedUrl = normalizeUrl(url);
    const currentSettings = (await storage.get()) || DEFAULT_FIREWALL_SETTINGS;
    const updated = {
      ...currentSettings,
      allowList: currentSettings.allowList.filter(item => item !== normalizedUrl),
    };
    await storage.set(updated);
  },
  async addToDenyList(url: string) {
    const normalizedUrl = normalizeUrl(url);
    const currentSettings = (await storage.get()) || DEFAULT_FIREWALL_SETTINGS;

    if (!currentSettings.denyList.includes(normalizedUrl)) {
      const allowList = currentSettings.allowList.filter(item => item !== normalizedUrl);
      const updated = {
        ...currentSettings,
        denyList: [...currentSettings.denyList, normalizedUrl],
        allowList,
      };
      await storage.set(updated);
    }
  },
  async removeFromDenyList(url: string) {
    const normalizedUrl = normalizeUrl(url);
    const currentSettings = (await storage.get()) || DEFAULT_FIREWALL_SETTINGS;
    const updated = {
      ...currentSettings,
      denyList: currentSettings.denyList.filter(item => item !== normalizedUrl),
    };
    await storage.set(updated);
  },
}) as FirewallStorage;
