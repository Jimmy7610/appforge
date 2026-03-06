"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Blueprint } from "@/lib/ai/generateBlueprint";

type SavedProject = {
    id: string;
    createdAt: string;
    idea: string;
    platform: string;
    businessModel: string;
    targetUsers: string;
    coreFeature: string;
    generatedBlueprint: Blueprint;
};

export default function Dashboard() {
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [businessModelFilter, setBusinessModelFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("appforge_blueprints");
            if (stored) {
                setProjects(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        }
    }, []);

    const displayMap: Record<string, string | undefined> = {
        web: "Web App",
        mobile: "Mobile App",
        desktop: "Desktop App",
        free: "Free Tool",
        saas: "SaaS",
        marketplace: "Marketplace",
        internal: "Internal Tool"
    };

    const getBlueprintUrl = (project: SavedProject) => {
        return `/project/blueprint?id=${project.id}`;
    };

    const handleDelete = (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this blueprint?");
        if (!confirmDelete) return;

        try {
            const updatedProjects = projects.filter((project) => project.id !== id);
            setProjects(updatedProjects);
            localStorage.setItem("appforge_blueprints", JSON.stringify(updatedProjects));
        } catch (e) {
            console.error("Failed to delete project", e);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const json = JSON.parse(content);

                if (!json || typeof json !== "object") {
                    throw new Error("Invalid structure");
                }

                const hasBlueprint = json.generatedBlueprint && typeof json.generatedBlueprint === 'object';

                const newProject: SavedProject = {
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    idea: json.idea || json.projectName || "Imported Project",
                    platform: json.platform || "",
                    businessModel: json.businessModel || "",
                    targetUsers: json.targetUsers || "",
                    coreFeature: json.coreFeature || "",
                    generatedBlueprint: hasBlueprint ? {
                        features: Array.isArray(json.generatedBlueprint.features) ? json.generatedBlueprint.features : [],
                        techStack: Array.isArray(json.generatedBlueprint.techStack) ? json.generatedBlueprint.techStack : [],
                        databaseTables: Array.isArray(json.generatedBlueprint.databaseTables) ? json.generatedBlueprint.databaseTables : [],
                        apiRoutes: Array.isArray(json.generatedBlueprint.apiRoutes) ? json.generatedBlueprint.apiRoutes : [],
                        roadmap: Array.isArray(json.generatedBlueprint.roadmap) ? json.generatedBlueprint.roadmap : []
                    } : {
                        features: [],
                        techStack: [],
                        databaseTables: [],
                        apiRoutes: [],
                        roadmap: []
                    }
                };

                const updatedProjects = [...projects, newProject];
                setProjects(updatedProjects);
                localStorage.setItem("appforge_blueprints", JSON.stringify(updatedProjects));

            } catch (error) {
                console.error("Failed to import bundle", error);
                window.alert("Invalid AppForge project bundle.");
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.idea?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesPlatform = platformFilter === "all" || project.platform === platformFilter;
        const matchesBusinessModel = businessModelFilter === "all" || project.businessModel === businessModelFilter;
        return matchesSearch && matchesPlatform && matchesBusinessModel;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortOption === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOption === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortOption === "idea-az") {
            const titleA = a.idea?.toLowerCase() || "";
            const titleB = b.idea?.toLowerCase() || "";
            return titleA.localeCompare(titleB);
        } else if (sortOption === "idea-za") {
            const titleA = a.idea?.toLowerCase() || "";
            const titleB = b.idea?.toLowerCase() || "";
            return titleB.localeCompare(titleA);
        }
        return 0;
    });

    const totalProjects = projects.length;
    const webAppsCount = projects.filter(p => p.platform === "web").length;
    const saasCount = projects.filter(p => p.businessModel === "saas").length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProjectsCount = projects.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;

    // Prevent hydration mismatch by returning null until mounted on client
    if (!mounted) {
        return (
            <div className="flex min-h-screen flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
                <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

                {/* Header section */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                        >
                            Import Project Bundle
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                        <Link
                            href="/project/new"
                            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95"
                        >
                            Create Project
                        </Link>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-zinc-400">Total Projects</h3>
                        <p className="mt-2 text-3xl font-bold text-white">{totalProjects}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-zinc-400">Web Apps</h3>
                        <p className="mt-2 text-3xl font-bold text-white">{webAppsCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-zinc-400">SaaS Projects</h3>
                        <p className="mt-2 text-3xl font-bold text-white">{saasCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-zinc-400">Recently Created</h3>
                        <p className="mt-2 text-3xl font-bold text-white">{recentProjectsCount}</p>
                        <p className="mt-1 text-xs text-zinc-500">Within the last 7 days</p>
                    </div>
                </div>

                {/* Search & Filters */}
                {projects.length > 0 && (
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-white/30"
                            />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <select
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className="w-full sm:w-auto min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-white/30 appearance-none"
                            >
                                <option value="all">All Platforms</option>
                                <option value="web">Web App</option>
                                <option value="mobile">Mobile App</option>
                                <option value="desktop">Desktop App</option>
                            </select>
                            <select
                                value={businessModelFilter}
                                onChange={(e) => setBusinessModelFilter(e.target.value)}
                                className="w-full sm:w-auto min-w-[180px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-white/30 appearance-none"
                            >
                                <option value="all">All Business Models</option>
                                <option value="free">Free Tool</option>
                                <option value="saas">SaaS</option>
                                <option value="marketplace">Marketplace</option>
                                <option value="internal">Internal Tool</option>
                            </select>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium text-zinc-400 whitespace-nowrap hidden sm:block">Sort By</span>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full sm:w-auto min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-white/30 appearance-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="idea-az">Idea A-Z</option>
                                    <option value="idea-za">Idea Z-A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects section */}
                <section>
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-lg backdrop-blur-sm sm:p-20">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-zinc-400">
                                {/* Simple folder icon using SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-zinc-200">No projects yet</h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                Get started by creating a new project.
                            </p>
                        </div>
                    ) : sortedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-lg backdrop-blur-sm sm:p-20">
                            <h3 className="text-lg font-medium text-zinc-200">No matching projects found</h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-white/20"
                                >
                                    <div>
                                        <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <span className="rounded-full bg-white/10 px-2 py-1 text-zinc-300">
                                                {displayMap[project.platform] || project.platform}
                                            </span>
                                        </div>

                                        <h3 className="mb-2 text-lg font-semibold text-zinc-200 line-clamp-2">
                                            {project.idea || "Untitled Project"}
                                        </h3>

                                        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                            </svg>
                                            {displayMap[project.businessModel] || project.businessModel}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            href={getBlueprintUrl(project)}
                                            className="flex flex-1 items-center justify-center rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
                                        >
                                            View Blueprint
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="flex items-center justify-center rounded-full border border-red-500/10 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 active:scale-95"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
