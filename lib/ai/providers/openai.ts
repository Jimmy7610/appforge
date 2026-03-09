import type { AIProvider, AIBlueprintGenerationResult } from "../types";
import type { BlueprintInput } from "../generateBlueprint";
import { generateLocalBlueprint } from "../generateBlueprint";

// TODO: Replace with real OpenAI API call (e.g. GPT-4o)
// TODO: Add API key configuration via provider settings
// TODO: Add model selection support

export const openAIProvider: AIProvider = {
    id: "openai",
    label: "OpenAI",

    async generateBlueprint(input: BlueprintInput): Promise<AIBlueprintGenerationResult> {
        // Placeholder: uses local generation until real API is wired
        const blueprint = generateLocalBlueprint(input);
        return { blueprint, provider: "openai" };
    },
};
