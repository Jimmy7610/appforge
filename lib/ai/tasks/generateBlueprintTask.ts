import type { AITaskHandler } from "./types";
import type { Blueprint } from "../types";
import { generateLocalBlueprint } from "../generateBlueprint";
import type { AIProviderId, AISettings } from "../types";

function extractJson(text: string | null | undefined): string {
    if (!text) return "{}";
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        return text.slice(start, end + 1);
    }
    return text;
}

export const generateBlueprintTask: AITaskHandler<"generateBlueprint"> = {
    id: "generateBlueprint",

    buildPrompt(input) {
        return `Generate a technical project blueprint for a new application.
App Idea: ${input.idea || "A general application"}
Platform: ${input.platform || "Web"}
Business Model: ${input.businessModel || "Not specified"}
Target Users: ${input.targetUsers || "General users"}
Core Feature: ${input.coreFeature}

INSTRUCTIONS:
- You MUST respect the Platform and Business Model. If the platform is 'Mobile App', provide mobile-specific tech (e.g., Swift, Kotlin, React Native, Mobile UI components). If the platform is 'Desktop', suggest desktop frameworks (e.g., Electron, Tauri).
- Do NOT default to SaaS/Web features (like RBAC, Paywalls) unless the Business Model is actually SaaS.
- For Games, focus on Game Engine, Assets, Physics, and Rendering logic instead of standard CRUD/SaaS patterns.

Return a pure JSON object (no markdown formatting, no backticks, no markdown code blocks) matching this exact TypeScript interface:
{
    "features": string[],
    "techStack": string[],
    "databaseTables": string[],
    "apiRoutes": string[],
    "roadmap": string[]
}

IMPORTANT: Reply ONLY with the raw JSON object. Do not wrap in \`\`\`json ... \`\`\`. Do not include any other text.`;
    },

    parseResponse(rawContent: string): Blueprint {
        const cleanJson = extractJson(rawContent);
        const parsed = JSON.parse(cleanJson) as Blueprint;

        // Defensive bounding: ensure structurally it is a safe blueprint even if model hallucinated
        parsed.features = Array.isArray(parsed.features) ? parsed.features : [];
        parsed.techStack = Array.isArray(parsed.techStack) ? parsed.techStack : [];
        parsed.databaseTables = Array.isArray(parsed.databaseTables) ? parsed.databaseTables : [];
        parsed.apiRoutes = Array.isArray(parsed.apiRoutes) ? parsed.apiRoutes : [];
        parsed.roadmap = Array.isArray(parsed.roadmap) ? parsed.roadmap : [];

        if (parsed.features.length === 0 || parsed.techStack.length === 0) {
            throw new Error("AI response missing core arrays (features/techStack).");
        }

        return parsed;
    },

    getFallback(input, settings, providerId, error): Blueprint {
        console.warn(`[${providerId}] Task fallback invoked for generateBlueprint:`, error);
        const localBp = generateLocalBlueprint(input);
        localBp.metadata = {
            provider: providerId,
            model: settings.model || "unknown",
            usedFallback: true,
            sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} (${settings.model || "unknown"}) — local fallback`
        };
        return localBp;
    }
};
