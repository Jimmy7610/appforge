import type { Blueprint, BlueprintInput } from "../generateBlueprint";

// --- Provider IDs ---
export type AIProviderId = "openai" | "ollama";

// --- Provider configuration ---
export type AIProviderConfig = {
    id: AIProviderId;
    label: string;
    // TODO: add model selection (e.g. "gpt-4o", "llama3")
    // TODO: add provider-specific settings (API key, base URL, temperature)
};

// --- Blueprint generation contract ---
export type AIBlueprintGenerationInput = BlueprintInput & {
    provider?: AIProviderId;
};

export type AIBlueprintGenerationResult = {
    blueprint: Blueprint;
    provider: AIProviderId;
};

// --- Provider interface ---
export interface AIProvider {
    id: AIProviderId;
    label: string;
    generateBlueprint(input: BlueprintInput): Promise<AIBlueprintGenerationResult>;
}
