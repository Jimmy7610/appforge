import { getStoredAISettings } from "./getStoredAISettings";
import { getAIProvider } from "./providerRegistry";
import { architectureChatTask } from "./tasks/architectureChatTask";
import { ArchitectureChatInput, ArchitectureChatResult } from "./tasks/types";

export async function architectureChat(input: ArchitectureChatInput): Promise<ArchitectureChatResult> {
    const settings = getStoredAISettings();
    const handler = architectureChatTask;
    const provider = getAIProvider(settings.provider);

    if (!provider) {
        // This shouldn't happen if the UI prevents unsupported providers
        return handler.getFallback(input, settings, "local" as any);
    }

    try {
        return await provider.executeTask({
            taskId: "architectureChat",
            input,
            settings
        }, handler);
    } catch (error) {
        console.error("Architecture Chat failed, using fallback", error);
        return handler.getFallback(input, settings, settings.provider, error);
    }
}
