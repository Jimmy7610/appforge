import { Activity, ArrowRight, Box, Cpu, Database } from "lucide-react";
import type { SimulationResult } from "@/lib/simulator";

interface ArchitectureSimulatorProps {
    simulation: SimulationResult | null;
}

export function ArchitectureSimulator({ simulation }: ArchitectureSimulatorProps) {
    if (!simulation) return null;

    return (
        <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                Architecture Simulation Result
            </h3>
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 md:p-8 space-y-10">

                    {/* User Flow */}
                    <div>
                        <h4 className="flex items-center gap-2 text-md font-medium text-blue-400 mb-4">
                            <span className="p-1.5 rounded-lg bg-blue-500/10"><ArrowRight className="w-4 h-4" /></span>
                            User Flow Simulation
                        </h4>
                        <div className="pl-9 space-y-4">
                            {simulation.userFlow.map((step, idx) => (
                                <div key={idx} className="flex gap-3 text-sm text-zinc-300">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs shrink-0 mt-0.5">{idx + 1}</div>
                                    <p className="leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Flow */}
                    <div>
                        <h4 className="flex items-center gap-2 text-md font-medium text-emerald-400 mb-4">
                            <span className="p-1.5 rounded-lg bg-emerald-500/10"><Cpu className="w-4 h-4" /></span>
                            System Flow Simulation
                        </h4>
                        <div className="pl-9 space-y-4">
                            {simulation.systemFlow.map((step, idx) => (
                                <div key={idx} className="flex gap-3 text-sm text-zinc-300">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs shrink-0 mt-0.5">{idx + 1}</div>
                                    <p className="leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Flow */}
                    <div>
                        <h4 className="flex items-center gap-2 text-md font-medium text-amber-400 mb-4">
                            <span className="p-1.5 rounded-lg bg-amber-500/10"><Database className="w-4 h-4" /></span>
                            Data Flow & Storage
                        </h4>
                        <div className="pl-9 space-y-4">
                            {simulation.dataFlow.map((step, idx) => (
                                <div key={idx} className="flex gap-3 text-sm text-zinc-300">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs shrink-0 mt-0.5">{idx + 1}</div>
                                    <p className="leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Observations */}
                    <div className="pt-6 border-t border-white/5">
                        <h4 className="flex items-center gap-2 text-md font-medium text-purple-400 mb-4">
                            <span className="p-1.5 rounded-lg bg-purple-500/10"><Box className="w-4 h-4" /></span>
                            Architecture Observations & Risks
                        </h4>
                        <div className="pl-9 space-y-3">
                            {simulation.observations.map((obs, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-sm">
                                    <span className="text-purple-500/50 mt-1 shrink-0">―</span>
                                    <p className="text-zinc-300 leading-relaxed">{obs}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
