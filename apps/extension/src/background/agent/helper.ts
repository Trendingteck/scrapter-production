import {
  type ProviderConfig,
  type ModelConfig,
  ProviderTypeEnum,
} from "@extension/storage";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { type BaseMessage, AIMessage } from "@langchain/core/messages";
import { ChatResult } from "@langchain/core/outputs";
import { authStore } from "@extension/storage";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatXAI } from "@langchain/xai";
import { MANAGED_MODEL_IDS } from "@extension/storage";

const API_ENDPOINT = "http://localhost:3000/api/v1";

class ScrapterSaaSModel extends BaseChatModel {
  private modelName: string;
  private temperature: number;

  constructor(fields: { modelName: string; temperature?: number }) {
    super(fields as any);
    this.modelName = fields.modelName;
    this.temperature = fields.temperature ?? 0.7;
  }

  _llmType() {
    return "scrapter_saas";
  }

  async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
  ): Promise<ChatResult> {
    const token = (await authStore.get()).sessionToken;
    if (!token) {
      throw new Error("Authentication required. Please log in to Scrapter.");
    }

    // Convert messages to a format the API expects
    const formattedMessages = messages.map((m) => ({
      role: m._getType(),
      content: m.content,
    }));

    const response = await fetch(`${API_ENDPOINT}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: this.modelName, // API handles mapping 'scrapter-auto' to underlying model
        messages: formattedMessages,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error(
          "Plan limit reached. Please upgrade your subscription.",
        );
      }
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      const text = await response.text();
      throw new Error(`Scrapter API Error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const content = data.content || data.choices?.[0]?.message?.content || "";

    return {
      generations: [
        {
          text: content,
          message: new AIMessage(content),
        },
      ],
    };
  }
}

export function createChatModel(
  providerConfig: ProviderConfig,
  modelConfig: ModelConfig,
): BaseChatModel {
  const temperature = modelConfig.parameters?.temperature as number | undefined;

  // 1. Check for Managed Models first
  if (
    modelConfig.modelName === MANAGED_MODEL_IDS.AUTO ||
    modelConfig.modelName === MANAGED_MODEL_IDS.BEST
  ) {
    return new ScrapterSaaSModel({
      modelName: modelConfig.modelName,
      temperature: temperature,
    });
  }

  // 2. Custom Providers (BYOK)
  if (providerConfig.apiKey) {
    console.log(`Using BYOK for provider: ${providerConfig.type}`);

    switch (providerConfig.type) {
      case ProviderTypeEnum.OpenAI:
        return new ChatOpenAI({
          apiKey: providerConfig.apiKey,
          modelName: modelConfig.modelName,
          temperature: temperature,
        });

      case ProviderTypeEnum.Anthropic:
        return new ChatAnthropic({
          apiKey: providerConfig.apiKey,
          modelName: modelConfig.modelName,
          temperature: temperature,
        });

      case ProviderTypeEnum.Gemini:
        return new ChatGoogleGenerativeAI({
          apiKey: providerConfig.apiKey,
          model: modelConfig.modelName,
          temperature: temperature,
        });

      // ... other providers

      default:
        // Fallback if provider not locally supported but key exists
        return new ScrapterSaaSModel({
          modelName: MANAGED_MODEL_IDS.AUTO,
          temperature: temperature,
        });
    }
  }

  // Default Fallback
  return new ScrapterSaaSModel({
    modelName: MANAGED_MODEL_IDS.AUTO,
    temperature: temperature,
  });
}
