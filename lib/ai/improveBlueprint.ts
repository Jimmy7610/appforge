import type { Blueprint, AISettings } from "./types";
import type { ImproveBlueprintInput } from "./tasks/types";
import { getAIProvider } from "./providerRegistry";
import { resolveAISettings } from "./settings";
import { getStoredAISettings } from "./getStoredAISettings";
import { getAITaskHandler } from "./tasks/taskRegistry";

/**
 * Main entry point for improving an existing blueprint.
 * Resolves settings, looks up the active provider, and dispatches the execution
 * to the generic Task Layer.
 */
export async function improveBlueprint(
    input: ImproveBlueprintInput,
    explicitSettings?: Partial<AISettings>
): Promise<Blueprint> {
    const storedSettings = getStoredAISettings();

    const providerOverride = input.originalInput?.provider ? { provider: input.originalInput.provider } : {};

    const finalOverrides: Partial<AISettings> = {
        ...storedSettings,
        ...providerOverride,
        ...(explicitSettings || {})
    };

    const resolvedSettings = resolveAISettings(finalOverrides);

    const provider = getAIProvider(resolvedSettings.provider);
    const handler = getAITaskHandler("improveBlueprint");

    return provider.executeTask({
        taskId: "improveBlueprint",
        input,
        settings: resolvedSettings
    }, handler);
}
