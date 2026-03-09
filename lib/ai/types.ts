// --- Provider IDs ---
export type AIProviderId = "openai" | "ollama";

// --- Provider configuration ---
export type AIProviderConfig = {
    id: AIProviderId;
    label: string;
};

// --- AI settings ---
export type AISettings = {
    provider: AIProviderId;
    model: string;
    baseUrl?: string;
    apiKey?: string;
    // TODO: add temperature, maxTokens, and other generation parameters
};

// --- Blueprint types (canonical definitions) ---
export type BlueprintInput = {
    idea?: string;
    platform?: string;
    businessModel?: string;
    targetUsers?: string;
    coreFeature?: string;
    provider?: AIProviderId;
};

export type Blueprint = {
    features: string[];
    techStack: string[];
    databaseTables: string[];
    apiRoutes: string[];
    roadmap: string[];
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

