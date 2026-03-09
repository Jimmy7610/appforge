import { getStoredAISettings } from "./getStoredAISettings";
import { providerRegistry } from "./providerRegistry";
import { architectureChatTask } from "./tasks/architectureChatTask";
import { ArchitectureChatInput, ArchitectureChatResult } from "./tasks/types";

export async function architectureChat(input: ArchitectureChatInput): Promise<ArchitectureChatResult> {
    const settings = getStoredAISettings();
    const provider = (providerRegistry as any)[settings.provider];

    if (!provider) {
        // This shouldn't happen if the UI prevents unsupported providers
        return architectureChatTask.getFallback(input, settings, "local" as any);
    }

    try {
        return await provider.executeTask("architectureChat", input, settings);
    } catch (error) {
        console.error("Architecture Chat failed, using fallback", error);
        return architectureChatTask.getFallback(input, settings, settings.provider, error);
    }
}
