import type { AIProviderId, AISettings } from "./types";
import { providerDefaults, DEFAULT_PROVIDER } from "./defaults";

// TODO: Add persistent user settings (localStorage or DB)
// TODO: Add environment-based secret injection for API keys

/**
 * Resolves a complete AISettings object by merging optional overrides
 * on top of the provider defaults. Falls back to the default provider
 * when no provider is specified.
 */
export function resolveAISettings(input?: Partial<AISettings>): AISettings {
    const providerId: AIProviderId =
        input?.provider && input.provider in providerDefaults
            ? input.provider
            : DEFAULT_PROVIDER;

    const defaults = providerDefaults[providerId];

    return {
        ...defaults,
        ...input,
        provider: providerId, // always use the validated provider
    };
}
