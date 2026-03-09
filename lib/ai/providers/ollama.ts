import type { AIProvider, AIBlueprintGenerationResult, AISettings } from "../types";
import type { BlueprintInput, Blueprint } from "../generateBlueprint";
import { generateLocalBlueprint } from "../generateBlueprint";

// TODO: Add Ollama model discovery (GET http://localhost:11434/api/tags)
// TODO: Support streaming responses (stream: true)
// TODO: Add provider connection/health testing
// TODO: Add better handling for missing local models (e.g. prompt user to pull)

function buildPrompt(input: BlueprintInput): string {
    return `Generate a technical project blueprint for a new application.
App Idea: ${input.idea || "A general web application"}
Platform: ${input.platform || "Web"}
Business Model: ${input.businessModel || "SaaS"}
Target Users: ${input.targetUsers || "General users"}
Core Feature: ${input.coreFeature || "User authentication and dashboard"}

Return a pure JSON object (no markdown formatting, no backticks, no markdown code blocks) matching this exact TypeScript interface:
{
    "features": string[],
    "techStack": string[],
    "databaseTables": string[],
    "apiRoutes": string[],
    "roadmap": string[]
}

IMPORTANT: Reply ONLY with the raw JSON object. Do not wrap in \`\`\`json ... \`\`\`. Do not include any other text.`;
}

function extractJson(text: string): string {
    // Sometimes Ollama might still surround output in backticks despite instructions
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    // Attempt to locate a JSON object boundary
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        return text.slice(start, end + 1);
    }
    return text;
}

export const ollamaProvider: AIProvider = {
    id: "ollama",
    label: "Ollama (Local)",

    async generateBlueprint(input: BlueprintInput, settings: AISettings): Promise<AIBlueprintGenerationResult> {
        const model = settings.model || "llama3";
        const baseUrl = settings.baseUrl || "http://localhost:11434";

        try {
            const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Pass apiKey if the architecture supports it eventually (not standard for Ollama but harmless)
                    ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: model,
                    prompt: buildPrompt(input),
                    stream: false, // Wait for full response
                    format: "json", // Instruct Ollama to use JSON mode where supported
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const rawContent = data.response;

            if (!rawContent) {
                throw new Error("Ollama API returned an empty response.");
            }

            const cleanJson = extractJson(rawContent);
            const parsed = JSON.parse(cleanJson) as Blueprint;

            if (!Array.isArray(parsed.features) || !Array.isArray(parsed.techStack)) {
                throw new Error("Ollama response missing required arrays.");
            }

            parsed.metadata = {
                provider: "ollama",
                model: model,
                usedFallback: false,
                sourceLabel: `Ollama (${model})`
            };

            return {
                blueprint: parsed,
                provider: "ollama"
            };

        } catch (e) {
            console.error("Ollama generation failed:", e);
            console.warn("Falling back to local generation.");

            const localBp = generateLocalBlueprint(input);
            localBp.metadata = {
                provider: "ollama",
                model: model,
                usedFallback: true,
                sourceLabel: `Ollama (${model}) — local fallback`
            };

            return {
                blueprint: localBp,
                provider: "ollama"
            };
        }
    },
};
