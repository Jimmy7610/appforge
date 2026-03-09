import { getAIProvider } from "./providerRegistry";
import { getAITaskHandler } from "./tasks/taskRegistry";
import { GenerateArchitectureDiagramInput, GenerateArchitectureDiagramResult } from "./tasks/types";
import { resolveAISettings } from "./settings";
import { getStoredAISettings } from "./getStoredAISettings";

/**
 * Main entry point for generating architecture diagrams.
 * Resolves settings and provider, then delegates to the task layer.
 */
export async function generateArchitectureDiagram(
    input: GenerateArchitectureDiagramInput
): Promise<GenerateArchitectureDiagramResult> {
    const storedSettings = getStoredAISettings();
    const resolvedSettings = resolveAISettings(storedSettings);

    const provider = getAIProvider(resolvedSettings.provider);
    const handler = getAITaskHandler("generateArchitectureDiagram");

    return provider.executeTask({
        taskId: "generateArchitectureDiagram",
        input,
        settings: resolvedSettings
    }, handler);
}
