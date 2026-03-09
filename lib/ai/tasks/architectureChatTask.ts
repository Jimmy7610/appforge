import { AITaskHandler, ArchitectureChatInput, ArchitectureChatResult } from "./types";
import { AISettings, AIProviderId } from "../types";

export const architectureChatTask: AITaskHandler<"architectureChat"> = {
    id: "architectureChat",

    buildPrompt(input: ArchitectureChatInput): string {
        const { originalInput, currentBlueprint, explanation, diagram, messages } = input;

        let context = `You are a practical software architect. Your goal is to answer questions about the following project blueprint.

## Project Context
Idea: ${originalInput.idea}
Platform: ${originalInput.platform}
Business Model: ${originalInput.businessModel}
Target Users: ${originalInput.targetUsers}
Core Feature: ${originalInput.coreFeature}

## Blueprint Details
Features: ${currentBlueprint.features.join(", ")}
Tech Stack: ${currentBlueprint.techStack.join(", ")}
Database Tables: ${currentBlueprint.databaseTables.join(", ")}
API Routes: ${currentBlueprint.apiRoutes.join(", ")}
Roadmap: ${currentBlueprint.roadmap.join(", ")}`;

        if (explanation) {
            context += `\n\n## Architecture Explanation\n${explanation}`;
        }

        if (diagram) {
            context += `\n\n## Architecture Diagram (Mermaid)\n${diagram}`;
        }

        const history = messages.map(m => `${m.role === "user" ? "User" : "Architect"}: ${m.content}`).join("\n");

        return `${context}

## Chat History
${history}

## Instructions
1. Answer the user's latest question clearly and concisely.
2. Stay grounded in the provided blueprint.
3. Suggest practical improvements or alternatives if relevant.
4. Avoid inventing unrelated details.
5. Return ONLY a JSON object with a single "reply" field containing your answer.

Example Output:
{
  "reply": "Based on your tech stack (Next.js + Tailwind), I recommend using..."
}

Return valid JSON only.`;
    },

    parseResponse(rawContent: string): ArchitectureChatResult {
        try {
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : rawContent;
            const parsed = JSON.parse(jsonText);

            if (!parsed.reply || typeof parsed.reply !== "string") {
                throw new Error("Invalid reply format in AI response");
            }

            return {
                reply: parsed.reply.trim()
            };
        } catch (e) {
            console.error("Failed to parse architecture chat response", e);
            throw e;
        }
    },

    getFallback(input: ArchitectureChatInput, settings: AISettings, providerId: AIProviderId, error?: unknown): ArchitectureChatResult {
        const lastUserMessage = [...input.messages].reverse().find(m => m.role === "user")?.content || "";
        const lowerCaseMessage = lastUserMessage.toLowerCase();

        let reply = "I'm having trouble connecting to my creative circuits right now. ";

        if (lowerCaseMessage.includes("redis") || lowerCaseMessage.includes("cache")) {
            reply += `Regarding your question about caching for ${input.originalInput.idea}: Redis would be a great addition to your stack (${input.currentBlueprint.techStack.join(", ")}) to improve performance for high-traffic features like ${input.originalInput.coreFeature || "your main app features"}.`;
        } else if (lowerCaseMessage.includes("scale")) {
            reply += `To scale this ${input.originalInput.platform} app, I'd suggest focusing on optimizing your database schema (${input.currentBlueprint.databaseTables.join(", ")}) and potentially moving to a microservices architecture for features like ${input.currentBlueprint.features.slice(0, 2).join(" and ")} as your user base grows.`;
        } else if (lowerCaseMessage.includes("auth")) {
            reply += `For authentication in this ${input.originalInput.businessModel} project, standard JWT or session-based auth would work well with your ${input.currentBlueprint.apiRoutes.length} API routes.`;
        } else {
            reply += `Based on your ${input.originalInput.platform} blueprint, this architecture seems solid. Your roadmap includes ${input.currentBlueprint.roadmap[0] || "scaling steps"}, which is a good priority.`;
        }

        return {
            reply,
            metadata: {
                provider: providerId,
                model: settings.model || "fallback",
                usedFallback: true,
                sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} — local fallback`
            }
        };
    }
};
