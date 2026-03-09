import type { AITaskId, AITaskHandler } from "./types";
import { generateBlueprintTask } from "./generateBlueprintTask";
import { improveBlueprintTask } from "./improveBlueprintTask";
import { explainBlueprintTask } from "./explainBlueprintTask";
import { generateArchitectureDiagramTask } from "./generateArchitectureDiagramTask";
import { architectureChatTask } from "./architectureChatTask";

// TODO: Register future tasks like generateDatabaseSchema, generateApiPlan, generateDocs, generateStarterContent
export const aiTaskRegistry: Record<AITaskId, AITaskHandler<any>> = {
    generateBlueprint: generateBlueprintTask,
    improveBlueprint: improveBlueprintTask,
    explainBlueprint: explainBlueprintTask,
    generateArchitectureDiagram: generateArchitectureDiagramTask,
    architectureChat: architectureChatTask
};

export function getAITaskHandler<T extends AITaskId>(taskId: T): AITaskHandler<T> {
    const handler = aiTaskRegistry[taskId];
    if (!handler) {
        throw new Error(`AI Task Handler not found for id: ${taskId}`);
    }
    return handler as AITaskHandler<T>;
}
