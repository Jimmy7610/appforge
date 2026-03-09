import type { AIProvider, AIBlueprintGenerationResult, AISettings } from "../types";
import type { BlueprintInput } from "../generateBlueprint";
import { generateLocalBlueprint } from "../generateBlueprint";

// TODO: Replace with real Ollama API call (POST http://localhost:11434/api/generate)
// TODO: Add Ollama model discovery (GET http://localhost:11434/api/tags)
// TODO: Add base URL configuration via provider settings
// TODO: Add model selection support
// TODO: Implement OpenAI parity (fetch, prompt, error fallback)

export const ollamaProvider: AIProvider = {
    id: "ollama",
    label: "Ollama (Local)",

    async generateBlueprint(input: BlueprintInput, settings: AISettings): Promise<AIBlueprintGenerationResult> {
        // Placeholder: uses local generation until real API is wired
        const blueprint = generateLocalBlueprint(input);
        return { blueprint, provider: "ollama" };
    },
};
