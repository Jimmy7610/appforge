"use client";

import { useState } from "react";
import { Copy, Check, FileCode } from "lucide-react";

interface CodeViewerProps {
    filename: string;
    path: string;
    content: string;
}

export function CodeViewer({ filename, path, content }: CodeViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none mb-1">{filename}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{path}</p>
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                <pre className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre">
                    <code>{content}</code>
                </pre>
            </div>
        </div>
    );
}
