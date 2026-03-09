import type { AITaskHandler } from "./types";
import type { Blueprint } from "../types";

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

export const improveBlueprintTask: AITaskHandler<"improveBlueprint"> = {
    id: "improveBlueprint",

    buildPrompt(input) {
        const customInstruction = input.instructions?.trim()
            ? input.instructions
            : "Improve this blueprint for clarity, completeness, and practical implementation.";

        return `You are refining an existing technical project blueprint.
App Idea: ${input.originalInput.idea || "A general web application"}
Platform: ${input.originalInput.platform || "Web"}
Business Model: ${input.originalInput.businessModel || "SaaS"}
Target Users: ${input.originalInput.targetUsers || "General users"}
Core Feature: ${input.originalInput.coreFeature || "User authentication and dashboard"}

CURRENT BLUEPRINT TO IMPROVE:
${JSON.stringify(input.currentBlueprint, null, 2)}

INSTRUCTIONS FOR IMPROVEMENT:
The user has provided the following directives for refining the architecture. If Architectural Presets are provided, you MUST explicitly adhere to their goals within the returned blueprint.

${customInstruction}

Return a pure JSON object (no markdown formatting, no backticks, no markdown code blocks) matching the exact same TypeScript interface:
{
    "features": string[],
    "techStack": string[],
    "databaseTables": string[],
    "apiRoutes": string[],
    "roadmap": string[]
}

IMPORTANT:
1. Maintain the original core idea and platform intent. Do not completely rewrite unrelated things unless asked.
2. Ensure arrays only contain strings.
3. Reply ONLY with the raw JSON object. Do not wrap in \`\`\`json ... \`\`\`. Do not include any other text.`;
    },

    parseResponse(rawContent: string): Blueprint {
        const cleanJson = extractJson(rawContent);
        const parsed = JSON.parse(cleanJson) as Blueprint;

        // Defensive bounding
        parsed.features = Array.isArray(parsed.features) ? parsed.features : [];
        parsed.techStack = Array.isArray(parsed.techStack) ? parsed.techStack : [];
        parsed.databaseTables = Array.isArray(parsed.databaseTables) ? parsed.databaseTables : [];
        parsed.apiRoutes = Array.isArray(parsed.apiRoutes) ? parsed.apiRoutes : [];
        parsed.roadmap = Array.isArray(parsed.roadmap) ? parsed.roadmap : [];

        if (parsed.features.length === 0 || parsed.techStack.length === 0) {
            throw new Error("AI response missing core arrays (features/techStack) during improvement.");
        }

        return parsed;
    },

    getFallback(input, settings, providerId, error): Blueprint {
        console.warn(`[${providerId}] Task fallback invoked for improveBlueprint:`, error);

        // Deep copy the existing blueprint so we don't accidentally mutate react state
        // before local deterministic modifications
        const improvedLocal: Blueprint = {
            features: [...(input.currentBlueprint.features || [])],
            techStack: [...(input.currentBlueprint.techStack || [])],
            databaseTables: [...(input.currentBlueprint.databaseTables || [])],
            apiRoutes: [...(input.currentBlueprint.apiRoutes || [])],
            roadmap: [...(input.currentBlueprint.roadmap || [])],
        };

        // Deterministic safe fallback enhancements
        const targetStr = input.instructions?.toLowerCase() || "";

        if (targetStr.includes("auth") || targetStr.includes("login")) {
            if (!improvedLocal.features.some(f => f.toLowerCase().includes("auth"))) {
                improvedLocal.features.unshift("Secure user authentication system");
            }
            if (!improvedLocal.databaseTables.some(t => t.includes("user"))) {
                improvedLocal.databaseTables.unshift("users");
                improvedLocal.databaseTables.unshift("sessions");
            }
            if (!improvedLocal.apiRoutes.some(r => r.includes("auth"))) {
                improvedLocal.apiRoutes.unshift("POST /api/auth/login");
            }
        }

        if (targetStr.includes("mobile") || targetStr.includes("responsive")) {
            if (!improvedLocal.features.some(f => f.toLowerCase().includes("mobile") || f.toLowerCase().includes("responsive"))) {
                improvedLocal.features.push("Responsive mobile-first design");
            }
        }

        if (targetStr.includes("scale") || targetStr.includes("scalable")) {
            if (!improvedLocal.techStack.some(t => t.toLowerCase().includes("redis") || t.toLowerCase().includes("cache"))) {
                improvedLocal.techStack.push("Redis for caching and rate-limiting");
            }
        }

        // Always add at least one minimal sign of "improvement" in a fallback if we didn't match something specific
        if (improvedLocal.roadmap.length > 0 && !improvedLocal.roadmap[improvedLocal.roadmap.length - 1].includes("Review and optimize")) {
            improvedLocal.roadmap.push("Review and optimize AI improvements (Fallback)");
        }

        improvedLocal.metadata = {
            provider: providerId,
            model: settings.model || "unknown",
            usedFallback: true,
            sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} (${settings.model || "unknown"}) — local improvement fallback`
        };

        return improvedLocal;
    }
};
