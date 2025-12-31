import { z } from 'zod';

// --- Enums ---

export enum ProviderTypeEnum {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Gemini = 'gemini',
  Ollama = 'ollama',
  XAI = 'xai',
  Grok = 'xai', // Alias
  Azure = 'azure',
  AzureOpenAI = 'azure', // Alias
  DeepSeek = 'deepseek',
  OpenRouter = 'openrouter',
  Groq = 'groq',
  Cerebras = 'cerebras',
  Llama = 'llama',
  CustomOpenAI = 'custom_openai',
  // ADDED: Managed provider
  Scrapter = 'scrapter', 
}

/**
 * In the Monolithic architecture, we only have one primary agent.
 * We keep the Enum structure to allow for future specialized agents (e.g. 'Analyst'),
 * but for now, 'Agent' is the unified executor.
 */
export enum AgentNameEnum {
  Agent = 'agent',
}

// --- Zod Schemas for Validation ---

export const ProviderConfigSchema = z.object({
  name: z.string().optional(),
  type: z.nativeEnum(ProviderTypeEnum),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  modelNames: z.array(z.string()).default([]),
  enabled: z.boolean().default(true).optional(), // Added enabled flag for UI state
  createdAt: z.number().optional(),
  // Provider specific settings
  apiVersion: z.string().optional(),
  deploymentName: z.string().optional(), // Azure
});

export const ModelConfigSchema = z.object({
  provider: z.string(), // e.g. 'openai', 'gemini', 'scrapter'
  modelName: z.string(),
  parameters: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    topP: z.number().optional(),
  }).optional(),
});

export const GeneralSettingsSchema = z.object({
  maxSteps: z.number().default(20),
  maxActionsPerStep: z.number().default(5),
  maxFailures: z.number().default(3),
  useVision: z.boolean().default(true),
  displayHighlights: z.boolean().default(true),
  planningInterval: z.number().default(1),
  minWaitPageLoad: z.number().default(1000),
  replayHistoricalTasks: z.boolean().default(false),
});

export const FirewallRuleSchema = z.object({
  domain: z.string(),
  action: z.enum(['allow', 'block']),
});

export const FirewallSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  allowList: z.array(z.string()).default([]),
  denyList: z.array(z.string()).default([]),
});

// --- Type Exports ---

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type GeneralSettingsConfig = z.infer<typeof GeneralSettingsSchema>;
export type FirewallSettings = z.infer<typeof FirewallSettingsSchema>;

// Default Helper
export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsConfig = {
  maxSteps: 20,
  maxActionsPerStep: 5,
  maxFailures: 3,
  useVision: true,
  displayHighlights: true,
  planningInterval: 1,
  minWaitPageLoad: 1000,
  replayHistoricalTasks: false
};

export const llmProviderModelNames: Record<string, string[]> = {
  [ProviderTypeEnum.OpenAI]: ['gpt-4o', 'gpt-4o-mini'],
  [ProviderTypeEnum.Anthropic]: ['claude-3-5-sonnet-20240620'],
  [ProviderTypeEnum.Gemini]: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3-flash-preview'],
  [ProviderTypeEnum.Ollama]: ['llama3:latest'],
  [ProviderTypeEnum.DeepSeek]: ['deepseek-chat', 'deepseek-reasoner'],
  [ProviderTypeEnum.Scrapter]: ['scrapter-auto', 'scrapter-best'],
};

export const llmProviderParameters: Record<string, Record<string, Record<string, number>>> = {
  [ProviderTypeEnum.OpenAI]: {
    [AgentNameEnum.Agent]: { temperature: 0.7, maxTokens: 4096 }
  },
  [ProviderTypeEnum.Anthropic]: {
    [AgentNameEnum.Agent]: { temperature: 0.7, maxTokens: 4096 }
  },
  [ProviderTypeEnum.Gemini]: {
    [AgentNameEnum.Agent]: { temperature: 0.7, maxTokens: 4096 }
  },
  [ProviderTypeEnum.DeepSeek]: {
    [AgentNameEnum.Agent]: { temperature: 0.7, maxTokens: 4096 }
  },
  [ProviderTypeEnum.Scrapter]: {
    [AgentNameEnum.Agent]: { temperature: 0.7, maxTokens: 4096 }
  },
};