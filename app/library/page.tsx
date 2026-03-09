"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Project } from "@/lib/ai/types";
import { loadSavedProjects, saveProjects } from "@/lib/projects/storage";

export default function LibraryPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az">("newest");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadProjects();
    }, []);

    const loadProjects = () => {
        setProjects(loadSavedProjects());
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this blueprint? This action cannot be undone.")) {
            return;
        }

        const updated = projects.filter(p => p.id !== id);
        saveProjects(updated);
        setProjects(updated);
    };

    const handleDuplicate = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const clone: Project = {
            ...project,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            idea: `${project.idea} (Copy)`
        };

        const updated = [clone, ...projects];
        saveProjects(updated);
        setProjects(updated);
    };

    const handleExport = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `appforge-project-${project.id.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredProjects = projects
        .filter(p =>
            p.idea.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.coreFeature.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.platform.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === "az") return a.idea.localeCompare(b.idea);
            return 0;
        });

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-12 lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Blueprint Library</h1>
                        <p className="text-lg text-zinc-400">Browse and manage all saved AppForge blueprints.</p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-zinc-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search blueprints..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-zinc-200 outline-none focus:border-white/30 transition-colors shadow-lg"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-white/30 transition-colors shadow-lg appearance-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="az">A – Z</option>
                        </select>
                        <Link
                            href="/project/new"
                            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95 whitespace-nowrap"
                        >
                            Create Project
                        </Link>
                    </div>
                </div>

                {/* Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/project/blueprint?id=${project.id}`)}
                                className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-white/5 cursor-pointer"
                            >
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 shadow-inner group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                                        </svg>
                                    </div>
                                    <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        {project.platform}
                                    </div>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white line-clamp-1">{project.idea}</h3>
                                <p className="mb-6 text-sm leading-relaxed text-zinc-500 line-clamp-2">
                                    {project.coreFeature}
                                </p>
                                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-zinc-600">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                        {project.versions && project.versions.length > 0 && (
                                            <span className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-500 border border-white/5">
                                                {project.versions.length} versions
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleDuplicate(project, e)}
                                            title="Duplicate"
                                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleExport(project, e)}
                                            title="Export"
                                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(project.id, e)}
                                            title="Delete"
                                            className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Indicator */}
                                < div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-white opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all" ></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 shadow-xl border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-zinc-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.625-1.5h1.5a.75.75 0 00.75-.75V11.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V12c0 .414.336.75.75.75zM2.25 12.75a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-18 0V18A2.25 2.25 0 004.5 20.25h15A2.25 2.25 0 0021.75 18v-5.25" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No blueprints yet</h2>
                        <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Create your first project idea to start building your blueprint collection.</p>
                        <Link
                            href="/project/new"
                            className="rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95"
                        >
                            Create Your First Project
                        </Link>
                    </div>
                )
                }
            </div >

            {/* TODO: Features for v2 */}
            {/* 
                - blueprint folders 
                - blueprint favorites 
                - blueprint tags 
                - blueprint version history 
                - public blueprint publishing 
            */}
        </main >
    );
}
