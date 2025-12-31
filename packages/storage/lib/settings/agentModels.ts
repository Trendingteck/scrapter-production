import { createStorage } from '../base/base';
import { AgentNameEnum, AgentNameEnum as AgentNames, ModelConfig } from './types';

// Default configuration strictly for the Monolithic Agent
const DEFAULT_AGENT_MODEL: Record<string, ModelConfig> = {
  [AgentNames.Agent]: {
    provider: 'scrapter',
    modelName: 'scrapter-auto',
    parameters: {
      temperature: 0.7
    }
  },
};

const storage = createStorage<Record<string, ModelConfig>>(
  'agentModels',
  DEFAULT_AGENT_MODEL,
  { area: 'sync' }
);

export const agentModelStore = Object.assign(storage, {
  getAgentModel: async (agentName: AgentNameEnum): Promise<ModelConfig> => {
    const models = await storage.get();
    return models?.[agentName] || DEFAULT_AGENT_MODEL[agentName];
  },

  getAllAgentModels: async (): Promise<Record<string, ModelConfig>> => {
    const models = await storage.get();
    return models || DEFAULT_AGENT_MODEL;
  },

  setAgentModel: async (agentName: AgentNameEnum, config: ModelConfig) => {
    const models = await storage.get();
    const updatedModels = {
      ...(models || DEFAULT_AGENT_MODEL),
      [agentName]: config
    };
    await storage.set(updatedModels);
  },

  reset: async () => {
    await storage.set(DEFAULT_AGENT_MODEL);
  },
});