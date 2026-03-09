import type { AIProvider, AISettings } from "../types";
import type { AITaskId, AITaskContext, AITaskHandler, AITaskResultMap } from "../tasks/types";

// TODO: Add Ollama model discovery (GET http://localhost:11434/api/tags)
// TODO: Support streaming responses (stream: true)
// TODO: Add provider connection/health testing
// TODO: Add better handling for missing local models (e.g. prompt user to pull)

export const ollamaProvider: AIProvider = {
    id: "ollama",
    label: "Ollama (Local)",

    async executeTask<T extends AITaskId>(context: AITaskContext<T>, handler: AITaskHandler<T>): Promise<AITaskResultMap[T]> {
        const { settings, input } = context;
        const model = settings.model || "llama3";
        const baseUrl = settings.baseUrl || "http://localhost:11434";

        try {
            const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: model,
                    prompt: handler.buildPrompt(input),
                    stream: false,
                    format: "json",
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const rawContent = data.response;

            if (!rawContent) {
                throw new Error("Ollama API returned an empty response.");
            }

            const parsed = handler.parseResponse(rawContent);

            if (typeof parsed === "object" && parsed !== null) {
                (parsed as any).metadata = {
                    provider: "ollama",
                    model: model,
                    usedFallback: false,
                    sourceLabel: `Ollama (${model})`
                };
            }

            return parsed;

        } catch (e) {
            console.error(`Ollama execution failed for task ${context.taskId}:`, e);
            return handler.getFallback(input, settings, this.id, e);
        }
    },
};
