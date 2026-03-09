"use client";

import { Shield, Zap, Activity, Server, Radio, Building2, Rocket, Code2, Coins } from "lucide-react";
import { REFINE_PRESETS, RefinePreset } from "@/lib/projects/refinePresets";

interface RefinePresetsProps {
    onTogglePreset: (id: string) => void;
    selectedPresetIds: string[];
    isApplying?: boolean;
}

export function RefinePresets({ onTogglePreset, selectedPresetIds = [], isApplying = false }: RefinePresetsProps) {
    const getIcon = (type: RefinePreset["iconType"]) => {
        const className = "w-4 h-4";
        switch (type) {
            case "security": return <Shield className={className} />;
            case "scalability": return <Server className={className} />;
            case "performance": return <Zap className={className} />;
            case "production": return <Activity className={className} />;
            case "realtime": return <Radio className={className} />;
            case "saas": return <Building2 className={className} />;
            case "mvp": return <Rocket className={className} />;
            case "dx": return <Code2 className={className} />;
            case "cost": return <Coins className={className} />;
            default: return <Server className={className} />;
        }
    };

    return (
        <div className="mt-8 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    Refine with Presets
                </h3>
                {selectedPresetIds.length > 0 && (
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {selectedPresetIds.length} preset{selectedPresetIds.length === 1 ? '' : 's'} selected
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {REFINE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetIds.includes(preset.id);

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onTogglePreset(preset.id)}
                            disabled={isApplying}
                            className={`
                                group text-left p-3 rounded-xl border transition-all relative overflow-hidden
                                ${isSelected
                                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                                    : 'bg-zinc-900/50 border-white/5 hover:border-blue-500/30 hover:bg-zinc-800/80'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`p-1 rounded-md transition-colors 
                                    ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-blue-400 group-hover:bg-blue-500/10'}
                                `}>
                                    {getIcon(preset.iconType)}
                                </span>
                                <h4 className={`text-sm font-medium transition-colors 
                                    ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}
                                `}>
                                    {preset.title}
                                </h4>
                            </div>
                            <p className={`text-xs transition-colors line-clamp-2
                                ${isSelected ? 'text-blue-200/70' : 'text-zinc-500 group-hover:text-zinc-400'}
                            `}>
                                {preset.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
