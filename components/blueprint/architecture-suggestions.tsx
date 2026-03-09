"use client";

import { Sparkles, Shield, Zap, Search, Server, Database, Activity, Code, ChevronRight } from "lucide-react";
import { ArchitectureSuggestionsResult, ArchitectureSuggestion } from "@/lib/ai/types";

interface ArchitectureSuggestionsProps {
    result: ArchitectureSuggestionsResult;
    onSelectSuggestion: (instruction: string) => void;
    isApplying?: boolean;
}

export function ArchitectureSuggestions({ result, onSelectSuggestion, isApplying = false }: ArchitectureSuggestionsProps) {
    if (!result.suggestions || result.suggestions.length === 0) {
        return null;
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "security": return <Shield className="w-4 h-4" />;
            case "performance": return <Zap className="w-4 h-4" />;
            case "observability": return <Activity className="w-4 h-4" />;
            case "data": return <Database className="w-4 h-4" />;
            case "architecture": return <Server className="w-4 h-4" />;
            case "scalability": return <Activity className="w-4 h-4" />;
            default: return <Code className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "low": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    return (
        <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white mb-1">Architecture Suggestions</h3>
                        <p className="text-sm text-blue-200/70">Click a suggestion to automatically populate your refine prompt.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.suggestions.map((suggestion: ArchitectureSuggestion) => (
                    <button
                        key={suggestion.id}
                        onClick={() => onSelectSuggestion(suggestion.instruction)}
                        disabled={isApplying}
                        className="group flex flex-col text-left rounded-xl bg-zinc-900/60 p-5 border border-white/10 hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed z-20 relative"
                    >
                        <div className="flex items-start justify-between w-full mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                                    {getCategoryIcon(suggestion.category)}
                                </span>
                                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                                    {suggestion.title}
                                </h4>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4 flex-grow">
                            {suggestion.rationale}
                        </p>
                        <div className="mt-auto pt-3 border-t border-white/5 w-full">
                            <p className="text-[10px] text-zinc-500 font-mono truncate hover:text-clip hover:whitespace-normal transition-all" title={suggestion.instruction}>
                                <span className="text-blue-400 font-bold mr-2">PROMPT</span>
                                {suggestion.instruction}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {result.metadata && (
                <div className="mt-6 flex items-center justify-end">
                    <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] font-medium text-zinc-500">
                        <span className={`h-1 w-1 rounded-full ${result.metadata.usedFallback || result.metadata.provider === "local" ? "bg-amber-500" : "bg-blue-500"}`}></span>
                        Suggested via: {result.metadata.sourceLabel}
                    </span>
                </div>
            )}
        </div>
    );
}
