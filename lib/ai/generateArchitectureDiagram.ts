import { getAIProvider } from "./providers/providerRegistry";
import { getAITaskHandler } from "./tasks/taskRegistry";
import { GenerateArchitectureDiagramInput, GenerateArchitectureDiagramResult } from "./tasks/types";
import { AIGenerationMetadata } from "./types";

export async function generateArchitectureDiagram(input: GenerateArchitectureDiagramInput): Promise<GenerateArchitectureDiagramResult> {
    const storedSettings = typeof window !== "undefined" ? localStorage.getItem("appforge_ai_settings") : null;
    const settings = storedSettings ? JSON.parse(storedSettings) : { provider: "local" };

    const providerId = settings.provider || "local";
    const model = settings.model || "";
    const apiKey = settings.apiKey || "";
    const baseUrl = settings.baseUrl || "";

    const provider = getAIProvider(providerId);
    const handler = getAITaskHandler("generateArchitectureDiagram");

    const metadata: AIGenerationMetadata = {
        provider: providerId,
        model: model || (providerId === "local" ? "deterministic" : "default"),
        usedFallback: false,
        sourceLabel: providerId === "openai" ? "OpenAI" : providerId === "ollama" ? "Ollama" : "Local Generator"
    };

    try {
        const result = await provider.executeTask("generateArchitectureDiagram", input, {
            model,
            apiKey,
            baseUrl
        });

        // Ensure result has metadata attached
        if (!result.metadata) {
            result.metadata = metadata;
        }

        return result;
    } catch (e) {
        console.error("Architecture diagram generation failed, falling back", e);
        return handler.getFallback(input, settings, providerId, e);
    }
}
