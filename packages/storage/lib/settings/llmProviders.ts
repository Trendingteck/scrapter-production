import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import { type AgentNameEnum, llmProviderModelNames, llmProviderParameters, ProviderTypeEnum, type ProviderConfig } from './types';

// Interface for storing multiple LLM provider configurations
export interface LLMKeyRecord {
  providers: Record<string, ProviderConfig>;
}

export type LLMProviderStorage = BaseStorage<LLMKeyRecord> & {
  setProvider: (providerId: string, config: ProviderConfig) => Promise<void>;
  getProvider: (providerId: string) => Promise<ProviderConfig | undefined>;
  removeProvider: (providerId: string) => Promise<void>;
  hasProvider: (providerId: string) => Promise<boolean>;
  getAllProviders: () => Promise<Record<string, ProviderConfig>>;
  updateProvider: (providerId: string, updates: Partial<ProviderConfig>) => Promise<void>;
};

// Storage for LLM provider configurations
const storage = createStorage<LLMKeyRecord>(
  'modelProviders',
  { providers: {} },
  {
    area: 'sync',
    liveUpdate: true,
  },
);

export function getProviderTypeByProviderId(providerId: string): ProviderTypeEnum {
  // Return a default, or handle custom logic if needed. 
  // Since we are SaaS, we might just default to 'openai' or 'anthropic' as backed by our server.
  // For now, keeping the mapping simple.
  switch (providerId) {
    case ProviderTypeEnum.OpenAI:
    case ProviderTypeEnum.Anthropic:
    case ProviderTypeEnum.DeepSeek:
    case ProviderTypeEnum.Gemini:
    case ProviderTypeEnum.Grok:
    case ProviderTypeEnum.Ollama: // Ollama might still be local? SaaS usually replaces everything, but let's stick to the prompt. "Strip out all local API key management"
    case ProviderTypeEnum.OpenRouter:
    case ProviderTypeEnum.Groq:
    case ProviderTypeEnum.Cerebras:
      return providerId;
    default:
      return ProviderTypeEnum.OpenAI; // Default fallback
  }
}

export function getDefaultDisplayNameFromProviderId(providerId: string): string {
  switch (providerId) {
    case ProviderTypeEnum.OpenAI:
      return 'OpenAI';
    case ProviderTypeEnum.Anthropic:
      return 'Anthropic';
    case ProviderTypeEnum.DeepSeek:
      return 'DeepSeek';
    case ProviderTypeEnum.Gemini:
      return 'Google Gemini';
    case ProviderTypeEnum.Grok:
      return 'xAI Grok';
    case ProviderTypeEnum.Ollama:
      return 'Ollama (Local)';
    case ProviderTypeEnum.AzureOpenAI:
      return 'Azure OpenAI';
    case ProviderTypeEnum.OpenRouter:
      return 'OpenRouter';
    case ProviderTypeEnum.Groq:
      return 'Groq';
    case ProviderTypeEnum.Cerebras:
      return 'Cerebras';
    case ProviderTypeEnum.Llama:
      return 'Meta Llama';
    case ProviderTypeEnum.CustomOpenAI:
      return 'Custom (OpenAI Compatible)';
    default:
      return providerId;
  }
}

export function getDefaultProviderConfig(providerId: string): ProviderConfig {
  return {
    name: providerId,
    type: providerId as ProviderTypeEnum,
    modelNames: llmProviderModelNames[providerId as ProviderTypeEnum] || [],
    createdAt: Date.now(),
  }
}

export function getDefaultAgentModelParams(providerId: string, agentName: AgentNameEnum): Record<string, number> {
  const providerType = providerId as ProviderTypeEnum;
  const newParameters = llmProviderParameters[providerType]?.[agentName] || llmProviderParameters[ProviderTypeEnum.OpenAI][agentName];
  return newParameters;
}

// Helper functions
export function isBuiltInProvider(type: ProviderTypeEnum): boolean {
  return type !== ProviderTypeEnum.CustomOpenAI;
}

export function validateProviderConfig(config: ProviderConfig): boolean {
  if (!config.type) return false;
  if (config.type === ProviderTypeEnum.CustomOpenAI && (!config.modelNames || config.modelNames.length === 0)) {
    return false;
  }
  return true;
}

export const llmProviderStore: LLMProviderStorage = Object.assign(storage, {
  async setProvider(providerId: string, config: ProviderConfig) {
    const completeConfig: ProviderConfig = {
      name: config.name || providerId,
      type: config.type || (providerId as ProviderTypeEnum),
      createdAt: config.createdAt || Date.now(),
      modelNames: config.modelNames || [],
    };
    const current = await storage.get();
    await storage.set({
      providers: {
        ...current.providers,
        [providerId]: {
          ...completeConfig,
          apiKey: config.apiKey
        },
      },
    });
  },
  async getProvider(providerId: string) {
    const data = await storage.get();
    return data?.providers?.[providerId];
  },
  async removeProvider(providerId: string) {
    const current = await storage.get();
    const newProviders = { ...(current?.providers || {}) };
    delete newProviders[providerId];
    await storage.set({ providers: newProviders });
  },
  async hasProvider(providerId: string) {
    const data = await storage.get();
    return data?.providers ? (providerId in data.providers) : false;
  },
  async getAllProviders() {
    const data = await storage.get();
    return data?.providers || {};
  },
  async updateProvider(providerId: string, updates: Partial<ProviderConfig>) {
    const current = await storage.get();
    const currentProvider = current?.providers?.[providerId] || getDefaultProviderConfig(providerId);
    await llmProviderStore.setProvider(providerId, { ...currentProvider, ...updates });
  }
}) as LLMProviderStorage;
