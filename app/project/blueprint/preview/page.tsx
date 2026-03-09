"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, RefreshCw, Layers, FileCode } from "lucide-react";
import { Project, Blueprint } from "@/lib/ai/types";
import { buildFullProject } from "@/lib/export/buildFullProject";
import { buildFileTree, FileNode } from "@/lib/utils/preview-utils";
import { BrowserTree } from "@/components/blueprint/browser-tree";
import { CodeViewer } from "@/components/blueprint/code-viewer";
import { BackToDashboard } from "@/components/back-to-dashboard";
import { loadSavedProjects } from "@/lib/projects/storage";

function PreviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    const [project, setProject] = useState<Project | null>(null);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            router.push("/library");
            return;
        }

        const loadProject = () => {
            const projects: Project[] = loadSavedProjects();
            const found = projects.find((p) => p.id === id);
            if (found) {
                setProject(found);
                generateFiles(found);
            } else {
                router.push("/library");
            }
        };

        loadProject();
    }, [id, router]);

    const generateFiles = (proj: Project) => {
        setIsLoading(true);
        try {
            // Use current blueprint or active version if available
            // In AppForge, the blueprint page sets 'blueprint' state
            // Project type also contains 'blueprint' and 'versions'
            const activeBlueprint = proj.generatedBlueprint;

            const files = buildFullProject({
                idea: proj.idea,
                platform: proj.platform,
                businessModel: proj.businessModel,
                targetUsers: proj.targetUsers,
                coreFeature: proj.coreFeature,
                blueprint: activeBlueprint,
                displayMap: {
                    web: "Web App",
                    mobile: "Mobile App",
                    desktop: "Desktop App",
                    free: "Free Tool",
                    saas: "SaaS",
                    marketplace: "Marketplace",
                    internal: "Internal Tool"
                }
            });

            const tree = buildFileTree(files);
            setFileTree(tree);

            // Select first file by default (usually README.md)
            if (tree.length > 0) {
                const findFirstFile = (nodes: FileNode[]): FileNode | null => {
                    for (const node of nodes) {
                        if (node.type === "file") return node;
                        if (node.children) {
                            const found = findFirstFile(node.children);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                setSelectedFile(findFirstFile(tree));
            }
        } catch (error) {
            console.error("Failed to generate project preview:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-zinc-400">Assembling project preview...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-950 text-zinc-200 overflow-hidden">
            {/* Back to dashboard */}
            <div className="px-6 pt-4 pb-0 bg-zinc-900/50">
                <BackToDashboard />
            </div>
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/50 px-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/project/blueprint?id=${id}`}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-white mb-0.5">{project.idea}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-tight">Preview</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-none">Scaffolding generated from blueprint</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <Link
                        href={`/project/blueprint?id=${id}`}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Full Project</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden">
                {/* Sidebar: File Tree */}
                <aside className="w-72 shrink-0 border-r border-white/5 bg-zinc-900/30 flex flex-col">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <Layers className="w-3.5 h-3.5" />
                        Project Bundle
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        <BrowserTree
                            nodes={fileTree}
                            onSelect={setSelectedFile}
                            activePath={selectedFile?.path}
                        />
                    </div>
                </aside>

                {/* Content Panel: Code Viewer */}
                <section className="flex-1 p-6 lg:p-10 bg-zinc-950/50">
                    {selectedFile ? (
                        <CodeViewer
                            filename={selectedFile.name}
                            path={selectedFile.path}
                            content={selectedFile.content || ""}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center opacity-30">
                            <div className="mb-4 rounded-full bg-zinc-800 p-8">
                                <FileCode className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No file selected</h3>
                            <p className="max-w-xs text-sm">Select a file from the sidebar to inspect its generated content.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        }>
            <PreviewContent />
        </Suspense>
    );
}
