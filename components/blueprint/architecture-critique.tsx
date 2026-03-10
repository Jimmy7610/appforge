"use client";

import { AlertTriangle, Zap, Shield, HelpCircle, Lightbulb, ChevronDown, ChevronUp, BarChart, Info } from "lucide-react";
import { BlueprintCritique, CritiqueItem } from "@/lib/ai/types";
import { useState } from "react";
import { ArchitectureScore } from "./architecture-score";

interface ArchitectureCritiqueProps {
    critique: BlueprintCritique;
}

export function ArchitectureCritique({ critique }: ArchitectureCritiqueProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Architecture Score Panel */}
            {critique.scores && <ArchitectureScore scores={critique.scores} />}

            {/* Header / Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Architectural Critique</h2>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Senior Architect Review</p>
                        </div>
                    </div>
                    <div className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${critique.priorityLevel === "high"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : critique.priorityLevel === "medium"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                        {critique.priorityLevel} Priority
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 leading-relaxed text-sm sm:text-base italic bg-white/5 p-5 rounded-xl border border-white/5">
                        "{critique.overallAssessment}"
                    </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-zinc-400">
                    <Info className="w-4 h-4" />
                    <p className="text-xs font-medium">{critique.summary}</p>
                </div>
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CritiqueSection
                    title="Key Risks"
                    items={critique.risks}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    colorClass="text-red-400"
                    bgColorClass="bg-red-500/10"
                />
                <CritiqueSection
                    title="Potential Bottlenecks"
                    items={critique.bottlenecks}
                    icon={<Zap className="w-4 h-4" />}
                    colorClass="text-amber-400"
                    bgColorClass="bg-amber-500/10"
                />
                <CritiqueSection
                    title="Security Concerns"
                    items={critique.securityConcerns}
                    icon={<Shield className="w-4 h-4" />}
                    colorClass="text-emerald-400"
                    bgColorClass="bg-emerald-500/10"
                />
                <CritiqueSection
                    title="Missing Considerations"
                    items={critique.missingConsiderations}
                    icon={<HelpCircle className="w-4 h-4" />}
                    colorClass="text-blue-400"
                    bgColorClass="bg-blue-500/10"
                />
            </div>

            {/* Recommendations */}
            {critique.recommendations.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Technical Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {critique.recommendations.map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                                <h4 className="text-sm font-bold text-indigo-300 mb-1.5">{item.title}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.detail}</p>
                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Architect's Advice</p>
                                    <p className="text-xs text-zinc-300 font-medium">{item.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata */}
            {critique.metadata && (
                <div className="flex items-center justify-end px-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] font-medium text-zinc-500">
                        <span className={`h-1 w-1 rounded-full ${critique.metadata.usedFallback ? "bg-amber-500" : "bg-indigo-500"}`}></span>
                        Critique generated via: {critique.metadata.sourceLabel}
                    </span>
                </div>
            )}
        </div>
    );
}

interface CritiqueSectionProps {
    title: string;
    items: CritiqueItem[];
    icon: React.ReactNode;
    colorClass: string;
    bgColorClass: string;
}

function CritiqueSection({ title, items, icon, colorClass, bgColorClass }: CritiqueSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${bgColorClass} ${colorClass}`}>
                        {icon}
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">{title}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="group relative">
                            <div className="flex items-start justify-between mb-1">
                                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{item.title}</h4>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${item.severity === "high" ? "text-red-400 bg-red-400/10" :
                                        item.severity === "medium" ? "text-amber-400 bg-amber-400/10" :
                                            "text-blue-400 bg-blue-400/10"
                                    }`}>
                                    {item.severity}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-2">{item.detail}</p>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                <span className="font-bold text-zinc-400 uppercase tracking-widest mr-1.5">Fix:</span>
                                {item.recommendation}
                            </p>
                            {idx < items.length - 1 && <div className="mt-4 border-b border-white/5" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
