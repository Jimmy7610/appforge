import type { AISettings } from "./types";

const STORAGE_KEY = "appforge_ai_settings";

export function loadAISettings(): Partial<AISettings> | null {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (typeof parsed !== "object" || parsed === null) return null;

        return parsed as Partial<AISettings>;
    } catch (e) {
        console.warn("Failed to load AI settings from localStorage", e);
        return null;
    }
}

export function saveAISettings(settings: Partial<AISettings>) {
    // TODO: Add server-side persistence (e.g., database)
    // TODO: Add encrypted secret handling for API keys
    // TODO: Add provider connection testing before saving
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save AI settings to localStorage", e);
    }
}

export function clearAISettings() {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Failed to clear AI settings from localStorage", e);
    }
}
