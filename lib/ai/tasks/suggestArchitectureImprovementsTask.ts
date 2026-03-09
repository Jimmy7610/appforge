import {
    AITaskHandler,
    AITaskInputMap,
    AITaskResultMap
} from "./types";
import { AIProviderId, AISettings, ArchitectureSuggestion, ArchitectureSuggestionsResult } from "../types";

const SUGGEST_PROMPT = `You are a Senior Software Architect reviewing an application blueprint. 
Your task is to analyze the existing architecture and propose 5 to 8 HIGH-VALUE, ACTIONABLE improvements.

Consider the following areas for improvement based on the provided context:
- Security (Authentication, Authorization, Rate Limiting)
- Scalability & Performance (Caching, Load Balancing, Optimizing DB)
- Observability (Monitoring, Logging, Error Tracking)
- Data (Indexing, Background Jobs, Storage Strategies)
- Development (CI/CD, Testing Strategies)

### Original App Concept
Idea: {{idea}}
Platform: {{platform}}
Business Model: {{businessModel}}
Target Users: {{targetUsers}}
Core Feature: {{coreFeature}}

### Current Blueprint Architecture
Features:
{{features}}

Tech Stack:
{{techStack}}

Database Tables:
{{databaseTables}}

API Routes:
{{apiRoutes}}

### Output Instructions
You MUST return ONLY valid JSON matching the exact schema below. Do not include markdown formatting or extra text.

{
  "suggestions": [
    {
      "id": "A unique string ID (e.g., 'add-auth', 'redis-cache')",
      "title": "Short UI Label (e.g., 'Add JWT Authentication')",
      "instruction": "A command ready to be used as a refine prompt (e.g., 'Add JWT authentication to all secure API routes and update the user schema.')",
      "rationale": "Short explanation of why this matters (1-2 sentences)",
      "category": "security | scalability | performance | observability | architecture | data",
      "priority": "high | medium | low"
    }
  ]
}
`;

export const suggestArchitectureImprovementsTask: AITaskHandler<"suggestArchitectureImprovements"> = {
    id: "suggestArchitectureImprovements",

    buildPrompt(input: AITaskInputMap["suggestArchitectureImprovements"]): string {
        const { originalInput, currentBlueprint } = input;

        return SUGGEST_PROMPT
            .replace("{{idea}}", originalInput.idea || "N/A")
            .replace("{{platform}}", originalInput.platform || "N/A")
            .replace("{{businessModel}}", originalInput.businessModel || "N/A")
            .replace("{{targetUsers}}", originalInput.targetUsers || "N/A")
            .replace("{{coreFeature}}", originalInput.coreFeature || "N/A")
            .replace("{{features}}", currentBlueprint.features ? currentBlueprint.features.map((f: string) => "- " + f).join("\\n") : "None defined.")
            .replace("{{techStack}}", currentBlueprint.techStack ? currentBlueprint.techStack.map((t: string) => "- " + t).join("\\n") : "None defined.")
            .replace("{{databaseTables}}", currentBlueprint.databaseTables ? currentBlueprint.databaseTables.map((t: string) => "- " + t).join("\\n") : "None defined.")
            .replace("{{apiRoutes}}", currentBlueprint.apiRoutes ? currentBlueprint.apiRoutes.map((r: string) => "- " + r).join("\\n") : "None defined.");
    },

    parseResponse(rawContent: string): AITaskResultMap["suggestArchitectureImprovements"] {
        try {
            const cleanJson = rawContent.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

            const validatedSuggestions: ArchitectureSuggestion[] = suggestions.map((item: any, i: number) => ({
                id: item.id || "suggestion-" + i,
                title: item.title || "Improve Architecture",
                instruction: item.instruction || "Make general architectural improvements.",
                rationale: item.rationale || "This is a recommended best practice.",
                category: item.category || "architecture",
                priority: ["low", "medium", "high"].includes(item.priority) ? item.priority : "medium"
            }));

            return {
                suggestions: validatedSuggestions
            };
        } catch (error) {
            console.error("Failed to parse suggestArchitectureImprovements response:", error);
            // Return decent fallback structure if parsing fails completely
            return {
                suggestions: [
                    {
                        id: "fallback-error",
                        title: "Review Architecture",
                        instruction: "Review the current architecture for general improvements.",
                        rationale: "The AI response could not be analyzed.",
                        category: "architecture",
                        priority: "medium"
                    }
                ]
            };
        }
    },

    getFallback(input: AITaskInputMap["suggestArchitectureImprovements"], settings: AISettings, providerId: AIProviderId, error?: unknown): AITaskResultMap["suggestArchitectureImprovements"] {
        const { currentBlueprint } = input;
        const suggestions: ArchitectureSuggestion[] = [];

        const bpStr = JSON.stringify(currentBlueprint).toLowerCase();

        // Check for Auth
        if (bpStr.includes("user") || bpStr.includes("profile")) {
            if (!bpStr.includes("auth") && !bpStr.includes("jwt") && !bpStr.includes("session")) {
                suggestions.push({
                    id: "add-auth",
                    title: "Add Authentication",
                    instruction: "Implement robust user authentication (e.g., JWT or session-based) and secure API routes.",
                    rationale: "User profiles require secure mechanisms for login and session management.",
                    category: "security",
                    priority: "high"
                });
            }
        }

        // Check for Caching / Realtime
        if (bpStr.includes("chat") || bpStr.includes("realtime") || bpStr.includes("live") || bpStr.includes("feed")) {
            if (!bpStr.includes("redis") && !bpStr.includes("websocket")) {
                suggestions.push({
                    id: "add-redis-websockets",
                    title: "Add Redis & WebSockets",
                    instruction: "Integrate Redis for fast caching and WebSockets for real-time state synchronization.",
                    rationale: "Live features demand low latency and efficient pub/sub mechanisms.",
                    category: "performance",
                    priority: "high"
                });
            }
        }

        // Check for Payments
        if (bpStr.includes("payment") || bpStr.includes("subscription") || bpStr.includes("premium") || input.originalInput.businessModel === "saas") {
            if (!bpStr.includes("webhook") && !bpStr.includes("stripe")) {
                suggestions.push({
                    id: "secure-billing",
                    title: "Implement Billing Webhooks",
                    instruction: "Add secure webhook handlers for payment processing and subscription lifecycle management.",
                    rationale: "Reliable payment flows require asynchronous webhook validation.",
                    category: "architecture",
                    priority: "high"
                });
            }
        }

        // General additions if list is too short
        if (suggestions.length < 3) {
            if (!bpStr.includes("rate limit")) {
                suggestions.push({
                    id: "rate-limiting",
                    title: "Add API Rate Limiting",
                    instruction: "Implement rate limiting middleware on all public and authenticated API routes to prevent abuse.",
                    rationale: "Protects backend resources from accidental or malicious traffic spikes.",
                    category: "security",
                    priority: "medium"
                });
            }
        }

        if (suggestions.length < 4) {
            if (!bpStr.includes("monitor") && !bpStr.includes("log") && !bpStr.includes("observability")) {
                suggestions.push({
                    id: "add-observability",
                    title: "Add Observability Stack",
                    instruction: "Integrate structured tracing, error logging, and performance monitoring across the stack.",
                    rationale: "Production systems need deep visibility to debug issues quickly.",
                    category: "observability",
                    priority: "medium"
                });
            }
        }

        if (suggestions.length === 0) {
            suggestions.push({
                id: "general-review",
                title: "Scale Infrastructure",
                instruction: "Review the architecture and identify components that need better scaling or separation of concerns.",
                rationale: "Prepare the application for increased user load.",
                category: "scalability",
                priority: "medium"
            });
        }

        return {
            suggestions,
            metadata: {
                provider: "local",
                model: "deterministic-rulesEngine",
                usedFallback: true,
                sourceLabel: "Local Rule Engine"
            }
        };
    }
};
