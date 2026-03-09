import type { AISettings } from "./types";
import type { ExplainBlueprintInput, ExplainBlueprintResult } from "./tasks/types";
import { getAIProvider } from "./providerRegistry";
import { resolveAISettings } from "./settings";
import { getStoredAISettings } from "./getStoredAISettings";
import { getAITaskHandler } from "./tasks/taskRegistry";

/**
 * Main entry point for generating an architectural explanation of a blueprint.
 * Resolves local AI settings and calls the AI Task Layer.
 */
export async function explainBlueprint(
    input: ExplainBlueprintInput,
    explicitSettings?: Partial<AISettings>
): Promise<ExplainBlueprintResult> {
    const storedSettings = getStoredAISettings();

    const providerOverride = input.originalInput?.provider ? { provider: input.originalInput.provider } : {};

    const finalOverrides: Partial<AISettings> = {
        ...storedSettings,
        ...providerOverride,
        ...(explicitSettings || {})
    };

    const resolvedSettings = resolveAISettings(finalOverrides);

    const provider = getAIProvider(resolvedSettings.provider);
    const handler = getAITaskHandler("explainBlueprint");

    return provider.executeTask({
        taskId: "explainBlueprint",
        input,
        settings: resolvedSettings
    }, handler);
}
