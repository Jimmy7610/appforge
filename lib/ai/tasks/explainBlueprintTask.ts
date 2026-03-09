import type { AITaskHandler, ExplainBlueprintResult } from "./types";

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

export const explainBlueprintTask: AITaskHandler<"explainBlueprint"> = {
    id: "explainBlueprint",

    buildPrompt(input) {
        return `You are a senior software architect. Explain the following application architecture in clear developer-friendly language.
Describe:
- what the app does
- the purpose of the main features
- how the tech stack fits together
- what the database tables represent
- how the API routes work
- how the roadmap reflects development phases

App Idea: ${input.originalInput.idea || "A general application"}
Platform: ${input.originalInput.platform || "Web"}
Business Model: ${input.originalInput.businessModel || "SaaS"}
Target Users: ${input.originalInput.targetUsers || "General users"}
Core Feature: ${input.originalInput.coreFeature || "Core functionality"}

CURRENT BLUEPRINT CONTENT:
${JSON.stringify(input.currentBlueprint, null, 2)}

Return a pure JSON object (no markdown formatting, no backticks, no markdown code blocks) matching this exact JSON format:
{
    "explanation": "Your full explanation text here. Use markdown formatting inside the string (like newlines, bullet points, bold text) to keep it readable."
}

IMPORTANT:
1. Do not include any text outside the JSON object.
2. The explanation should be professional, insightful, and easy to read.
3. Keep the output strictly bound to the requested keys.`;
    },

    parseResponse(rawContent: string): ExplainBlueprintResult {
        const cleanJson = extractJson(rawContent);
        const parsed = JSON.parse(cleanJson);

        if (!parsed || typeof parsed.explanation !== "string" || !parsed.explanation.trim()) {
            throw new Error("AI response missing valid 'explanation' string payload.");
        }

        return {
            explanation: parsed.explanation.trim()
        };
    },

    getFallback(input, settings, providerId, error): ExplainBlueprintResult {
        console.warn(`[${providerId}] Task fallback invoked for explainBlueprint:`, error);

        const bp = input.currentBlueprint;
        const fallbackText = `### Architecture Overview
This application is designed as a ${input.originalInput.platform || "Web"} platform for ${input.originalInput.targetUsers || "general users"}.

**Core Features & Capability**
The system includes primary features such as:
${(bp.features || []).map(f => `- ${f}`).join('\n')}

**Technology Stack Phase**
It utilizes a modern tech stack consisting of:
${(bp.techStack || []).map(t => `- ${t}`).join('\n')}

**Data Layer**
The database is structured to support these entities:
${(bp.databaseTables || []).map(d => `- ${d}`).join('\n')}

**Network Interface**
The API boundaries defined for communication include:
${(bp.apiRoutes || []).map(a => `- ${a}`).join('\n')}

**Execution Roadmap**
Development is planned in the following stages:
${(bp.roadmap || []).map(r => `- ${r}`).join('\n')}

*(Note: This is a deterministically generated fallback explanation. Enable an AI Provider for deeper architectural insights.)*`;

        return {
            explanation: fallbackText,
            metadata: {
                provider: providerId,
                model: settings.model || "unknown",
                usedFallback: true,
                sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} (${settings.model || "unknown"}) — local explanation generator`
            }
        };
    }
};
