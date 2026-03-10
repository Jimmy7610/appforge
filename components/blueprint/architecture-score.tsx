"use client";

import { Shield, Zap, BarChart3, Settings, Activity } from "lucide-react";
import { ArchitectureScores } from "@/lib/ai/types";

interface ArchitectureScoreProps {
    scores: ArchitectureScores;
}

export function ArchitectureScore({ scores }: ArchitectureScoreProps) {
    const categories = [
        { label: "Security", score: scores.security, icon: <Shield className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Performance", score: scores.performance, icon: <Zap className="w-4 h-4" />, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Scalability", score: scores.scalability, icon: <BarChart3 className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Maintainability", score: scores.maintainability, icon: <Settings className="w-4 h-4" />, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8 mb-8 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Overall Score Circle */}
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-white/5"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                fill="none"
                                stroke="url(#score-gradient)"
                                strokeWidth="8"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * scores.overall) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white leading-none">{scores.overall}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Score</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Architecture Analysis</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div className={`p-1 rounded ${cat.bg} ${cat.color}`}>
                                            {cat.icon}
                                        </div>
                                        <span>{cat.label}</span>
                                    </div>
                                    <span className="text-zinc-200">{cat.score}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${cat.color.replace('text', 'bg')} transition-all duration-1000 ease-out`}
                                        style={{ width: `${cat.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
