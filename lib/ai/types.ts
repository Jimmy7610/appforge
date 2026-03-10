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

// --- Generation Metadata ---
export type AIGenerationMetadata = {
    provider: AIProviderId | "local";
    model: string;
    usedFallback: boolean;
    sourceLabel: string;
};

export type Blueprint = {
    features: string[];
    techStack: string[];
    databaseTables: string[];
    apiRoutes: string[];
    roadmap: string[];
    metadata?: AIGenerationMetadata;
};

export type CritiqueItem = {
    title: string;
    detail: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
};

export type ArchitectureScores = {
    overall: number;
    security: number;
    performance: number;
    scalability: number;
    maintainability: number;
};

export type BlueprintCritique = {
    overallAssessment: string;
    scores?: ArchitectureScores;
    risks: CritiqueItem[];
    bottlenecks: CritiqueItem[];
    securityConcerns: CritiqueItem[];
    missingConsiderations: CritiqueItem[];
    recommendations: CritiqueItem[];
    priorityLevel: "low" | "medium" | "high";
    summary: string;
    metadata?: AIGenerationMetadata;
};

export type ArchitectureSuggestion = {
    id: string;
    title: string;
    instruction: string;
    rationale: string;
    category: string;
    priority: "low" | "medium" | "high";
};

export type ArchitectureSuggestionsResult = {
    suggestions: ArchitectureSuggestion[];
    metadata?: AIGenerationMetadata;
};

// --- Versioning types ---
export type BlueprintVersion = {
    id: string;
    label: string;
    createdAt: string;
    blueprint: Blueprint;
    explanation?: string | null;
    diagram?: string | null;
    critique?: BlueprintCritique | null;
    metadata?: AIGenerationMetadata | null;
};

export type Project = {
    id: string;
    createdAt: string;
    idea: string;
    platform: string;
    businessModel: string;
    targetUsers: string;
    coreFeature: string;
    generatedBlueprint: Blueprint;
    versions?: BlueprintVersion[];
};

import type { AITaskId, AITaskContext, AITaskHandler, AITaskResultMap } from "./tasks/types";

// --- Provider interface ---
export interface AIProvider {
    id: AIProviderId;
    label: string;
    executeTask<T extends AITaskId>(context: AITaskContext<T>, handler: AITaskHandler<T>): Promise<AITaskResultMap[T]>;
}

