"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
    source: string;
    onRender?: (svg: string) => void;
}

/**
 * A lightweight client component to render Mermaid diagrams safely.
 */
export function MermaidDiagram({ source, onRender }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isIdInitialized, setIsIdInitialized] = useState(false);
    const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "Inter, sans-serif",
        });
        setIsIdInitialized(true);
    }, []);

    useEffect(() => {
        if (!isIdInitialized || !source) return;

        const cleanMermaidSource = (raw: string) => {
            let cleaned = raw.trim();

            // 1. Fix sequence diagram arrows hallucinated in flowcharts (e.g. --|Label| -> -->|Label|)
            cleaned = cleaned.replace(/--\|/g, "-->|");

            // 2. Fix trailing pipes on nodes (e.g. API -->|Label| /auth| -> API -->|Label| "/auth")
            cleaned = cleaned.replace(/-->\|([^|]+)\|\s*([^\s\[\]\(\)-]+)\|/g, '-->|$1| "$2"');

            // 3. Fix unquoted paths as standalone nodes (e.g. API --> /auth -> API --> "/auth")
            cleaned = cleaned.replace(/-->\s*(\/[^\s\[\]\(\)-]+)(?!\s*\[|\s*\(|\s*"|[\n\r]|$)/g, '--> "$1"');

            return cleaned;
        };

        const renderDiagram = async () => {
            try {
                const cleanedSource = cleanMermaidSource(source);
                setError(null);
                // Clear the container before rendering to prevent conflicts
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }

                const { svg: generatedSvg } = await mermaid.render(id.current, cleanedSource);
                setSvg(generatedSvg);
                if (onRender) onRender(generatedSvg);
            } catch (err: any) {
                console.error("Mermaid render error:", err);
                setError("Failed to render diagram. Please check the Mermaid source syntax.");
                if (onRender) onRender("");

                // When an error occurs, Mermaid might leave the container in a weird state
                // or throw an internal error. We clean up.
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }
            }
        };

        renderDiagram();
    }, [source, isIdInitialized]);

    if (!source) return null;

    return (
        <div className="mermaid-wrapper w-full overflow-hidden rounded-xl bg-zinc-900/40 border border-white/5 p-4 sm:p-8">
            {error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 rounded-full bg-rose-500/10 p-3 text-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-rose-400">{error}</p>
                    <p className="mt-1 text-xs text-zinc-500">The current source might have syntax errors.</p>
                </div>
            ) : svg ? (
                <div
                    ref={containerRef}
                    className="flex justify-center transition-opacity duration-300 opacity-100"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-blue-500"></div>
                </div>
            )}

            {/* TODO: Add SVG download button */}
            {/* TODO: Add zoom/pan support */}
            {/* TODO: Add theme toggle */}
        </div>
    );
}
