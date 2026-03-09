import type { AISettings } from "./types";
import { resolveAISettings } from "./settings";
import { loadAISettings } from "./storage";

/**
 * Returns fully resolved AI settings by layering stored settings
 * over the provider defaults.
 */
export function getStoredAISettings(): AISettings {
    const stored = loadAISettings();
    return resolveAISettings(stored || {});
}
