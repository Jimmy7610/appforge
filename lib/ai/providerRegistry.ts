import type { AIProvider, AIProviderId } from "./types";
import { openAIProvider } from "./providers/openai";
import { ollamaProvider } from "./providers/ollama";

// TODO: Add provider settings/config persistence
// TODO: Support registering custom providers at runtime

export const providerRegistry: Record<AIProviderId, AIProvider> = {
    openai: openAIProvider,
    ollama: ollamaProvider,
};

const DEFAULT_PROVIDER: AIProviderId = "openai";

export function getAIProvider(providerId?: string): AIProvider {
    if (providerId && providerId in providerRegistry) {
        return providerRegistry[providerId as AIProviderId];
    }
    return providerRegistry[DEFAULT_PROVIDER];
}
