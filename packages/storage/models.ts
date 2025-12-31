import { ProviderTypeEnum } from './lib/settings/types';

export const MANAGED_MODEL_IDS = {
  AUTO: 'scrapter-auto',
  BEST: 'scrapter-best',
};

export interface ModelOption {
  id: string;
  label: string;
  description?: string;
  provider: ProviderTypeEnum | 'scrapter';
  isCustom?: boolean;
}

export const MANAGED_MODELS: ModelOption[] = [
  {
    id: MANAGED_MODEL_IDS.AUTO,
    label: 'Scrapter Auto',
    description: 'Standard speed and efficiency (Gemini 2.5 Flash)',
    provider: 'scrapter',
  },
  {
    id: MANAGED_MODEL_IDS.BEST,
    label: 'Scrapter Best',
    description: 'High reasoning capability (Gemini 3 Flash Preview)',
    provider: 'scrapter',
  },
];

export const PROVIDER_DEFAULT_MODELS: Record<string, string[]> = {
  [ProviderTypeEnum.OpenAI]: ['gpt-4o', 'gpt-4o-mini'],
  [ProviderTypeEnum.Anthropic]: ['claude-3-5-sonnet-20240620'],
  [ProviderTypeEnum.Gemini]: ['gemini-2.0-flash', 'gemini-1.5-pro'],
  [ProviderTypeEnum.Ollama]: ['llama3:latest'],
};