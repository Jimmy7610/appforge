import { BlueprintInput, BlueprintCritique, Blueprint, AIProviderId } from "./types";
import { getStoredAISettings } from "./getStoredAISettings";
import { providerRegistry } from "./providerRegistry";
import { getAITaskHandler } from "./tasks/taskRegistry";

/**
 * High-level wrapper for performing an architectural critique of a blueprint.
 * Handles settings resolution, provider selection, and task execution.
 */
export async function critiqueBlueprint(
    originalInput: BlueprintInput,
    currentBlueprint: Blueprint
): Promise<BlueprintCritique> {
    const settings = getStoredAISettings();
    const providerId = settings.provider as AIProviderId;
    const provider = providerRegistry[providerId];

    // Default to local fallback if provider is not found
    if (!provider) {
        const handler = getAITaskHandler("critiqueBlueprint");
        return handler.getFallback({ originalInput, currentBlueprint }, settings, "local" as any);
    }

    try {
        return await provider.executeTask(
            {
                taskId: "critiqueBlueprint",
                input: { originalInput, currentBlueprint },
                settings
            },
            getAITaskHandler("critiqueBlueprint")
        );
    } catch (error) {
        console.error(`Critique generation failed with provider ${providerId}:`, error);
        const handler = getAITaskHandler("critiqueBlueprint");
        return handler.getFallback({ originalInput, currentBlueprint }, settings, providerId, error);
    }
}
