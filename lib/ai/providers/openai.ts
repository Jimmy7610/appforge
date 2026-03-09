import type { AIProvider, AISettings } from "../types";
import type { AITaskId, AITaskContext, AITaskHandler, AITaskResultMap } from "../tasks/types";

// TODO: Support streaming responses
// TODO: Add retry handling and rate limiting
// TODO: Refine model selection and prompt engineering

export const openAIProvider: AIProvider = {
    id: "openai",
    label: "OpenAI",

    async executeTask<T extends AITaskId>(context: AITaskContext<T>, handler: AITaskHandler<T>): Promise<AITaskResultMap[T]> {
        const { settings, input } = context;
        const model = settings.model || "gpt-3.5-turbo";

        if (!settings.apiKey) {
            console.warn("OpenAI: No API key provided, triggering fallback.");
            return handler.getFallback(input, settings, this.id, new Error("No API key"));
        }

        try {
            const baseUrl = settings.baseUrl || "https://api.openai.com/v1/chat/completions";
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "You are a senior software architect." },
                        { role: "user", content: handler.buildPrompt(input) }
                    ],
                    // We request json_object if supported, standard for structure tasks
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error("OpenAI API returned an empty response.");
            }

            const parsed = handler.parseResponse(content);

            // Attach successful metadata structurally
            if (typeof parsed === "object" && parsed !== null) {
                (parsed as any).metadata = {
                    provider: "openai",
                    model: model,
                    usedFallback: false,
                    sourceLabel: `OpenAI (${model})`
                };
            }

            return parsed;

        } catch (e) {
            console.error(`OpenAI execution failed for task ${context.taskId}:`, e);
            return handler.getFallback(input, settings, this.id, e);
        }
    },
};
