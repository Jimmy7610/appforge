import type { AIProviderId, AISettings } from "./types";

// TODO: Fetch real model lists from providers
// TODO: Add Ollama model discovery (GET http://localhost:11434/api/tags)
// TODO: Load defaults from environment variables for API keys / base URLs

export const providerDefaults: Record<AIProviderId, AISettings> = {
    openai: {
        provider: "openai",
        model: "gpt-default",
        // TODO: read from process.env.OPENAI_API_KEY
        // apiKey: undefined,
    },
    ollama: {
        provider: "ollama",
        model: "llama3",
        baseUrl: "http://localhost:11434",
    },
};

export const DEFAULT_PROVIDER: AIProviderId = "openai";
