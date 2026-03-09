import type { AITaskId, AITaskHandler } from "./types";
import { generateBlueprintTask } from "./generateBlueprintTask";
import { improveBlueprintTask } from "./improveBlueprintTask";

// TODO: Register future tasks like generateDatabaseSchema, generateApiPlan, generateDocs, generateStarterContent
export const aiTaskRegistry: Record<AITaskId, AITaskHandler<any>> = {
    generateBlueprint: generateBlueprintTask,
    improveBlueprint: improveBlueprintTask
};

export function getAITaskHandler<T extends AITaskId>(taskId: T): AITaskHandler<T> {
    const handler = aiTaskRegistry[taskId];
    if (!handler) {
        throw new Error(`AI Task Handler not found for id: ${taskId}`);
    }
    return handler as AITaskHandler<T>;
}
