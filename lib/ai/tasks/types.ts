import type { AIProviderId, AISettings } from "../types";
import type { BlueprintInput, Blueprint } from "../types";

// Extensible Task ID
export type AITaskId = "generateBlueprint" | "improveBlueprint" | "explainBlueprint" | "generateArchitectureDiagram" | "architectureChat";

export type ArchitectureChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export type ArchitectureChatInput = {
    originalInput: BlueprintInput;
    currentBlueprint: Blueprint;
    explanation?: string;
    diagram?: string;
    messages: ArchitectureChatMessage[];
};

export type ArchitectureChatResult = {
    reply: string;
    metadata?: import("../types").AIGenerationMetadata;
};

export type ImproveBlueprintInput = {
    originalInput: BlueprintInput;
    currentBlueprint: Blueprint;
    instructions?: string;
};

export type ExplainBlueprintInput = {
    originalInput: BlueprintInput;
    currentBlueprint: Blueprint;
};

export type ExplainBlueprintResult = {
    explanation: string;
    metadata?: import("../types").AIGenerationMetadata;
};

export type GenerateArchitectureDiagramInput = {
    originalInput: BlueprintInput;
    currentBlueprint: Blueprint;
};

export type GenerateArchitectureDiagramResult = {
    diagram: string;
    metadata?: import("../types").AIGenerationMetadata;
};

// Task Inputs Map
export interface AITaskInputMap {
    generateBlueprint: BlueprintInput;
    improveBlueprint: ImproveBlueprintInput;
    explainBlueprint: ExplainBlueprintInput;
    generateArchitectureDiagram: GenerateArchitectureDiagramInput;
    architectureChat: ArchitectureChatInput;
}

// Task Results Map
export interface AITaskResultMap {
    generateBlueprint: Blueprint;
    improveBlueprint: Blueprint;
    explainBlueprint: ExplainBlueprintResult;
    generateArchitectureDiagram: GenerateArchitectureDiagramResult;
    architectureChat: ArchitectureChatResult;
}

// Shared Execution Context
export interface AITaskContext<T extends AITaskId> {
    taskId: T;
    input: AITaskInputMap[T];
    settings: AISettings;
}

// Generic Task Handler Interface
export interface AITaskHandler<T extends AITaskId> {
    id: T;
    /** Builds the specific prompt string for the model */
    buildPrompt(input: AITaskInputMap[T]): string;
    /** Parses the model's text response into the target result structure */
    parseResponse(rawContent: string): AITaskResultMap[T];
    /** Provides a fallback result if the AI provider fails completely */
    getFallback(input: AITaskInputMap[T], settings: AISettings, providerId: AIProviderId, error?: unknown): AITaskResultMap[T];
}
