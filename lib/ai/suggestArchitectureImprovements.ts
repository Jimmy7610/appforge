import type { BlueprintInput, Blueprint, ArchitectureSuggestionsResult, AISettings } from "./types";
import { getAIProvider } from "./providerRegistry";
import { resolveAISettings } from "./settings";
import { getStoredAISettings } from "./getStoredAISettings";
import { getAITaskHandler } from "./tasks/taskRegistry";

/**
 * Main entry point for suggesting architecture improvements for an existing blueprint.
 * Resolves settings, looks up the active provider, and dispatches the execution
 * to the generic Task Layer.
 */
export async function suggestArchitectureImprovements(
    originalInput: BlueprintInput,
    currentBlueprint: Blueprint,
    explicitSettings?: Partial<AISettings>
): Promise<ArchitectureSuggestionsResult> {
    const storedSettings = getStoredAISettings();

    const providerOverride = originalInput?.provider ? { provider: originalInput.provider } : {};

    const finalOverrides: Partial<AISettings> = {
        ...storedSettings,
        ...providerOverride,
        ...(explicitSettings || {})
    };

    const resolvedSettings = resolveAISettings(finalOverrides);

    const provider = getAIProvider(resolvedSettings.provider);
    const handler = getAITaskHandler("suggestArchitectureImprovements");

    return provider.executeTask({
        taskId: "suggestArchitectureImprovements",
        input: { originalInput, currentBlueprint },
        settings: resolvedSettings
    }, handler);
}
