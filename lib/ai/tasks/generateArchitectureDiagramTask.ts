import { AITaskHandler, GenerateArchitectureDiagramInput, GenerateArchitectureDiagramResult } from "./types";
import { AISettings, AIProviderId } from "../types";

export const generateArchitectureDiagramTask: AITaskHandler<"generateArchitectureDiagram"> = {
    id: "generateArchitectureDiagram",

    buildPrompt(input: GenerateArchitectureDiagramInput): string {
        const { originalInput, currentBlueprint } = input;

        return `You are a system architect. Generate a Mermaid.js architecture diagram for the following project.
        
Project Idea: ${originalInput.idea}
Platform: ${originalInput.platform}
Business Model: ${originalInput.businessModel}
Target Users: ${originalInput.targetUsers}
Core Feature: ${originalInput.coreFeature}

Blueprint Architecture:
Features: ${currentBlueprint.features.join(", ")}
Tech Stack: ${currentBlueprint.techStack.join(", ")}
Database Tables: ${currentBlueprint.databaseTables.join(", ")}
API Routes: ${currentBlueprint.apiRoutes.join(", ")}

Instructions:
1. Create a "graph TD" or "graph LR" Mermaid diagram.
2. Include nodes for: User/Client, Frontend/App Layer, API/Backend Layer, Database/Data Layer.
3. Show relationships between components.
4. Keep the diagram professional and clear.
5. Return ONLY a JSON object with a single "diagram" field containing the Mermaid code.

Example Output Format:
{
  "diagram": "graph TD\\nUser --> App\\nApp --> API\\nAPI --> DB"
}

Return valid JSON only.`;
    },

    parseResponse(rawContent: string): GenerateArchitectureDiagramResult {
        try {
            // Find JSON block
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : rawContent;
            const parsed = JSON.parse(jsonText);

            if (!parsed.diagram || typeof parsed.diagram !== "string") {
                throw new Error("Invalid diagram format in AI response");
            }

            return {
                diagram: parsed.diagram.trim()
            };
        } catch (e) {
            console.error("Failed to parse diagram response", e);
            throw e;
        }
    },

    getFallback(input: GenerateArchitectureDiagramInput, settings: AISettings, providerId: AIProviderId, error?: unknown): GenerateArchitectureDiagramResult {
        const platform = input.originalInput.platform || "App";
        const { currentBlueprint } = input;

        let diagramCode = `graph TD
    User["User / Client"]
    App["${platform} Interface"]
    API["Backend API Layer"]
    DB[("Database")]

    User --> App
    App --> API
    API --> DB`;

        if (currentBlueprint.databaseTables?.length > 0) {
            const tables = currentBlueprint.databaseTables.slice(0, 3).join(", ");
            diagramCode += `\n    DB --- Tables["Tables: ${tables}..."]`;
        }

        if (currentBlueprint.apiRoutes?.length > 0) {
            const routes = currentBlueprint.apiRoutes.slice(0, 2).join(", ");
            diagramCode += `\n    API --- Routes["Routes: ${routes}..."]`;
        }

        return {
            diagram: diagramCode,
            metadata: {
                provider: providerId,
                model: settings.model || "fallback",
                usedFallback: true,
                sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} — local fallback`
            }
        };
    }
};
