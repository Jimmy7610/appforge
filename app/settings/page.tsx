"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Save, RotateCcw } from "lucide-react";

import type { AIProviderId, AISettings } from "@/lib/ai/types";
import { getStoredAISettings } from "@/lib/ai/getStoredAISettings";
import { saveAISettings, clearAISettings } from "@/lib/ai/storage";
import { resolveAISettings, providerDefaults } from "@/lib/ai/settings";

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);

    // Form state
    const [provider, setProvider] = useState<AIProviderId>("openai");
    const [model, setModel] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Initial load
    useEffect(() => {
        setMounted(true);
        const stored = getStoredAISettings();
        setProvider(stored.provider);
        setModel(stored.model);
        setApiKey(stored.apiKey || "");
        setBaseUrl(stored.baseUrl || "");
    }, []);

    // Provider switch handler
    const handleProviderChange = (newProvider: AIProviderId) => {
        const defaults = providerDefaults[newProvider];
        setProvider(newProvider);
        setModel(defaults.model);
        setBaseUrl(defaults.baseUrl || "");
        // We do not clear API key blindly just in case they want to reuse it,
        // but typically different providers have different keys.
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const newSettings: Partial<AISettings> = {
                provider,
                model: model.trim() || undefined,
            };

            if (apiKey.trim()) newSettings.apiKey = apiKey.trim();
            if (baseUrl.trim()) newSettings.baseUrl = baseUrl.trim();

            const resolved = resolveAISettings(newSettings);
            saveAISettings(resolved);

            setSaveMessage({ text: "Settings saved successfully", type: "success" });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (e) {
            console.error(e);
            setSaveMessage({ text: "Failed to save settings", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (!window.confirm("Are you sure you want to reset to default settings?")) return;

        clearAISettings();
        setSaveMessage({ text: "Settings reset to defaults", type: "success" });
        setTimeout(() => setSaveMessage(null), 3000);

        // Reload defaults
        const defaults = getStoredAISettings();
        setProvider(defaults.provider);
        setModel(defaults.model);
        setApiKey(defaults.apiKey || "");
        setBaseUrl(defaults.baseUrl || "");
    };

    if (!mounted) {
        return <div className="min-h-screen bg-[#0A0A0A] p-6 flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white"></div>
        </div>;
    }

    return (
        <main className="min-h-screen bg-[#0A0A0A] p-6 pb-24 text-zinc-100">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Settings
                        </h1>
                        <p className="mt-2 text-zinc-400">
                            Configure application preferences and AI provider connections.
                        </p>
                    </div>
                </div>

                {/* AI Settings Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">AI Configuration</h2>

                    <div className="space-y-6">
                        {/* Provider */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                AI Provider
                            </label>
                            <select
                                value={provider}
                                onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
                                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                            >
                                <option value="openai">OpenAI</option>
                                <option value="ollama">Ollama (Local)</option>
                            </select>
                            <p className="mt-2 text-xs text-zinc-500">
                                Select the backend used for generating app blueprints.
                            </p>
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder={provider === "openai" ? "gpt-4o" : "llama3"}
                                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                            />
                            {/* TODO: Implement dynamic Ollama model discovery here instead of text input */}
                            {provider === "ollama" ? (
                                <p className="mt-2 text-xs text-amber-500/80">
                                    Note: Dynamic model discovery for Ollama will be added in a future update. Ensure the model is downloaded locally.
                                </p>
                            ) : (
                                <p className="mt-2 text-xs text-zinc-500">
                                    The specific model to request from the provider.
                                </p>
                            )}
                        </div>

                        {/* API Key */}
                        {provider === "openai" && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Securely stored in your browser's local storage. Not sent to our servers.
                                </p>
                            </div>
                        )}

                        {/* Base URL */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Base URL <span className="text-zinc-500 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder={provider === "ollama" ? "http://localhost:11434" : "https://api.openai.com/v1/chat/completions"}
                                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                            />
                            <p className="mt-2 text-xs text-zinc-500">
                                Override the default API endpoint. Useful for local proxies or custom Ollama ports.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving..." : "Save Settings"}
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset to Defaults
                            </button>
                        </div>

                        {saveMessage && (
                            <div className={`text-sm ${saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
