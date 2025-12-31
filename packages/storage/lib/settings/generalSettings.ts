import { createStorage } from '../base/base';
import {
  GeneralSettingsConfig,
  GeneralSettingsSchema,
  DEFAULT_GENERAL_SETTINGS
} from './types';

const storage = createStorage<GeneralSettingsConfig>(
  'generalSettings',
  DEFAULT_GENERAL_SETTINGS,
  { area: 'sync' }
);

export const generalSettingsStore = Object.assign(storage, {
  getSettings: async (): Promise<GeneralSettingsConfig> => {
    const settings = await storage.get();

    // Validate with Zod schema
    const parsed = GeneralSettingsSchema.safeParse({
      ...DEFAULT_GENERAL_SETTINGS,
      ...settings
    });

    if (parsed.success) {
      return parsed.data;
    }

    return DEFAULT_GENERAL_SETTINGS;
  },

  updateSettings: async (settings: Partial<GeneralSettingsConfig>) => {
    const current = await storage.get();
    const updated = { ...(current || DEFAULT_GENERAL_SETTINGS), ...settings };

    // Validate before saving
    const parsed = GeneralSettingsSchema.safeParse(updated);
    if (parsed.success) {
      await storage.set(parsed.data);
    } else {
      console.error("Invalid general settings", parsed.error);
      await storage.set(updated);
    }
  },

  reset: async () => {
    await storage.set(DEFAULT_GENERAL_SETTINGS);
  },
});