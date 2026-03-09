import type { AIProvider, AIBlueprintGenerationResult, AISettings } from "../types";
import type { BlueprintInput, Blueprint } from "../generateBlueprint";
import { generateLocalBlueprint } from "../generateBlueprint";

// TODO: Support streaming responses
// TODO: Add retry handling and rate limiting
// TODO: Refine model selection and prompt engineering

function buildPrompt(input: BlueprintInput): string {
    return `Generate a technical project blueprint for a new application.
App Idea: ${input.idea || "A general web application"}
Platform: ${input.platform || "Web"}
Business Model: ${input.businessModel || "SaaS"}
Target Users: ${input.targetUsers || "General users"}
Core Feature: ${input.coreFeature || "User authentication and dashboard"}

Return a pure JSON object (no markdown formatting, no backticks, no markdown code blocks) matching this exact TypeScript interface:
{
    "features": string[], // 5-7 key features
    "techStack": string[], // 5-7 core technologies (e.g. Next.js, Tailwind, Postgres)
    "databaseTables": string[], // 4-6 main database table names (lowercase, plural, e.g. "users", "projects")
    "apiRoutes": string[], // 4-6 core API routes (e.g. "GET /api/users", "POST /api/auth")
    "roadmap": string[] // 3 high-level phases
}

IMPORTANT: Reply ONLY with the raw JSON object. Do not wrap in \`\`\`json ... \`\`\`.`;
}

export const openAIProvider: AIProvider = {
    id: "openai",
    label: "OpenAI",

    async generateBlueprint(input: BlueprintInput, settings: AISettings): Promise<AIBlueprintGenerationResult> {
        if (!settings.apiKey) {
            console.warn("OpenAI: No API key provided, falling back to local generation.");
            return {
                blueprint: generateLocalBlueprint(input),
                provider: "openai"
            };
        }

        try {
            const baseUrl = settings.baseUrl || "https://api.openai.com/v1/chat/completions";
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model || "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a senior software architect." },
                        { role: "user", content: buildPrompt(input) }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error("OpenAI API returned an empty response.");
            }

            const parsed = JSON.parse(content) as Blueprint;

            if (!Array.isArray(parsed.features) || !Array.isArray(parsed.techStack)) {
                throw new Error("OpenAI response missing required arrays.");
            }

            return {
                blueprint: parsed,
                provider: "openai"
            };

        } catch (e) {
            console.error("OpenAI generation failed:", e);
            console.warn("Falling back to local generation.");
            return {
                blueprint: generateLocalBlueprint(input),
                provider: "openai"
            };
        }
    },
};
