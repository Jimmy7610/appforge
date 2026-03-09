import { providerDefaults } from "../defaults";

// TODO: Add support for remote Ollama servers with auth
// TODO: Return richer Ollama model metadata (size, family, modified time)

export async function fetchOllamaModels(baseUrl?: string): Promise<string[]> {
    const targetUrl = baseUrl || providerDefaults.ollama.baseUrl || "http://localhost:11434";

    try {
        const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/tags`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.models)) {
            return [];
        }

        const models = data.models
            .map((m: any) => m.name)
            .filter((name: any) => typeof name === "string" && name.trim().length > 0);

        // Deduplicate and return
        return Array.from(new Set<string>(models));
    } catch (e) {
        // Fail safely if Ollama is unavailable
        return [];
    }
}
