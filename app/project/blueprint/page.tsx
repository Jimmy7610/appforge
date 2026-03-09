"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import JSZip from "jszip";
import { generateBlueprint, type Blueprint } from "@/lib/ai/generateBlueprint";
import { improveBlueprint } from "@/lib/ai/improveBlueprint";
import { diffBlueprints, type BlueprintDiff, hasAnyChanges } from "@/lib/ai/diffBlueprints";
import { buildStarterPack, ExportInput } from "@/lib/export/buildStarterPack";
import { buildMarkdownFiles } from "@/lib/export/buildMarkdownFiles";
import { buildProjectBundle } from "@/lib/export/buildProjectBundle";

function BlueprintContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const getParam = (key: string) => searchParams.get(key) || undefined;
    const idParam = getParam("id");

    const displayMap: Record<string, string | undefined> = {
        web: "Web App",
        mobile: "Mobile App",
        desktop: "Desktop App",
        free: "Free Tool",
        saas: "SaaS",
        marketplace: "Marketplace",
        internal: "Internal Tool"
    };

    const [idea, setIdea] = useState(getParam("idea"));
    const [platform, setPlatform] = useState(getParam("platform"));
    const [businessModel, setBusinessModel] = useState(getParam("businessModel"));
    const [targetUsers, setTargetUsers] = useState(getParam("targetUsers"));
    const [coreFeature, setCoreFeature] = useState(getParam("coreFeature"));
    const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
    const [projectNotFound, setProjectNotFound] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Improve UI state
    const [isImproving, setIsImproving] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [diffResult, setDiffResult] = useState<BlueprintDiff | null>(null);

    useEffect(() => {
        setMounted(true);
        if (idParam) {
            try {
                const stored = localStorage.getItem("appforge_blueprints");
                if (stored) {
                    const blueprints = JSON.parse(stored);
                    const foundProject = blueprints.find((p: any) => p.id === idParam);
                    if (foundProject) {
                        setIdea(foundProject.idea);
                        setPlatform(foundProject.platform);
                        setBusinessModel(foundProject.businessModel);
                        setTargetUsers(foundProject.targetUsers);
                        setCoreFeature(foundProject.coreFeature);
                        setBlueprint(foundProject.generatedBlueprint);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to load project from localStorage", e);
            }
            setProjectNotFound(true);
        } else {
            setIsGenerating(true);
            generateBlueprint({
                idea: getParam("idea"),
                platform: getParam("platform"),
                businessModel: getParam("businessModel"),
                targetUsers: getParam("targetUsers"),
                coreFeature: getParam("coreFeature")
            }).then(bp => {
                setBlueprint(bp);
            }).catch(e => {
                console.error("Failed to generate blueprint", e);
                setProjectNotFound(true);
            }).finally(() => {
                setIsGenerating(false);
            });
        }
    }, [idParam, searchParams]);

    const handleRegenerate = async () => {
        setIsGenerating(true);
        // Reset diff state since this is a full regeneration wrapper
        setDiffResult(null);
        try {
            const bp = await generateBlueprint({ idea, platform, businessModel, targetUsers, coreFeature });
            setBlueprint(bp);
        } catch (e) {
            console.error("Failed to regenerate blueprint", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImprove = async () => {
        if (!blueprint) return;
        setIsImproving(true);
        try {
            const bp = await improveBlueprint({
                originalInput: { idea, platform, businessModel, targetUsers, coreFeature },
                currentBlueprint: blueprint,
                instructions: instructions
            });
            const diff = diffBlueprints(blueprint, bp);
            setDiffResult(diff);
            setBlueprint(bp);
            setInstructions(""); // Clear input on success
        } catch (e) {
            console.error("Failed to improve blueprint", e);
            window.alert("Failed to improve blueprint. Check console for details.");
        } finally {
            setIsImproving(false);
        }
    };

    const handleSave = () => {
        const newProject = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            idea: idea || "",
            platform: platform || "",
            businessModel: businessModel || "",
            targetUsers: targetUsers || "",
            coreFeature: coreFeature || "",
            generatedBlueprint: blueprint
        };

        try {
            const stored = localStorage.getItem("appforge_blueprints");
            const blueprints = stored ? JSON.parse(stored) : [];
            blueprints.push(newProject);
            localStorage.setItem("appforge_blueprints", JSON.stringify(blueprints));

            if (!idParam) {
                router.push("/dashboard");
            } else {
                window.alert("Blueprint saved as a new copy!");
                router.push("/dashboard");
            }
        } catch (e) {
            console.error("Failed to save blueprint", e);
        }
    };

    const handleUpdate = () => {
        if (!idParam) return;

        try {
            const stored = localStorage.getItem("appforge_blueprints");
            if (!stored) {
                window.alert("Project could not be updated.");
                return;
            }

            const blueprints = JSON.parse(stored);
            const index = blueprints.findIndex((p: any) => p.id === idParam);

            if (index === -1) {
                window.alert("Project could not be updated.");
                return;
            }

            const existing = blueprints[index];
            const updatedProject = {
                ...existing,
                idea: idea || "",
                platform: platform || "",
                businessModel: businessModel || "",
                targetUsers: targetUsers || "",
                coreFeature: coreFeature || "",
                generatedBlueprint: blueprint
            };

            blueprints[index] = updatedProject;
            localStorage.setItem("appforge_blueprints", JSON.stringify(blueprints));

            window.alert("Project updated successfully.");
        } catch (e) {
            console.error("Failed to update blueprint", e);
            window.alert("Project could not be updated.");
        }
    };

    const handleExport = () => {
        if (!blueprint) return;
        const starterPack = buildStarterPack({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const exportData = {
            idea: idea || "",
            platform: platform || "",
            businessModel: businessModel || "",
            targetUsers: targetUsers || "",
            coreFeature: coreFeature || "",
            generatedBlueprint: blueprint,
            starterPack
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-starter-pack.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportMarkdown = () => {
        if (!blueprint) return;
        const files = buildMarkdownFiles({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        files.forEach(file => {
            const blob = new Blob([file.content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    const handleExportBundle = () => {
        if (!blueprint) return;
        const bundleData = buildProjectBundle({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-project-bundle.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportZip = async () => {
        if (!blueprint) return;
        const bundleData = buildProjectBundle({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const zip = new JSZip();

        zip.file("README.md", bundleData.files["README.md"]);

        const docs = zip.folder("docs");
        docs?.file("PROJECT_SPEC.md", bundleData.files["docs/PROJECT_SPEC.md"]);
        docs?.file("DATABASE_SCHEMA.md", bundleData.files["docs/DATABASE_SCHEMA.md"]);
        docs?.file("API_ROUTES.md", bundleData.files["docs/API_ROUTES.md"]);
        docs?.file("TASKS.md", bundleData.files["docs/TASKS.md"]);

        const app = zip.folder("app");
        app?.file("globals.css", bundleData.files["app/globals.css"]);
        app?.file("page.tsx", bundleData.files["app/page.tsx"]);
        app?.file("layout.tsx", bundleData.files["app/layout.tsx"]);

        const dashboard = app?.folder("dashboard");
        dashboard?.file("page.tsx", bundleData.files["app/dashboard/page.tsx"]);

        const projectsFolder = app?.folder("projects");
        projectsFolder?.file("page.tsx", bundleData.files["app/projects/page.tsx"]);

        const settingsFolder = app?.folder("settings");
        settingsFolder?.file("page.tsx", bundleData.files["app/settings/page.tsx"]);

        const api = app?.folder("api");
        // Dynamically add all generated API routes
        for (const [path, content] of Object.entries(bundleData.files)) {
            if (path.startsWith("app/api/") && path.endsWith("/route.ts")) {
                const slug = path.replace("app/api/", "").replace("/route.ts", "");
                const folder = api?.folder(slug);
                folder?.file("route.ts", content);
            }
        }

        const components = zip.folder("components");
        const ui = components?.folder("ui");
        ui?.file("button.tsx", bundleData.files["components/ui/button.tsx"]);
        const dashboardComponents = components?.folder("dashboard");
        dashboardComponents?.file("stat-card.tsx", bundleData.files["components/dashboard/stat-card.tsx"]);

        const lib = zip.folder("lib");
        lib?.file("types.ts", bundleData.files["lib/types.ts"]);
        lib?.file("mock-data.ts", bundleData.files["lib/mock-data.ts"]);
        if (bundleData.files["lib/db/schema.ts"]) {
            const db = lib?.folder("db");
            db?.file("schema.ts", bundleData.files["lib/db/schema.ts"]);
        }
        if (bundleData.files["lib/generated/resources.ts"]) {
            const generated = lib?.folder("generated");
            generated?.file("resources.ts", bundleData.files["lib/generated/resources.ts"]);
        }

        // Conditional feature-based pages
        if (bundleData.files["app/profile/page.tsx"]) {
            const profileFolder = app?.folder("profile");
            profileFolder?.file("page.tsx", bundleData.files["app/profile/page.tsx"]);
        }
        if (bundleData.files["app/activity/page.tsx"]) {
            const activityFolder = app?.folder("activity");
            activityFolder?.file("page.tsx", bundleData.files["app/activity/page.tsx"]);
        }
        if (bundleData.files["app/team/page.tsx"]) {
            const teamFolder = app?.folder("team");
            teamFolder?.file("page.tsx", bundleData.files["app/team/page.tsx"]);
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = "appforge-project.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to generate zip", e);
        }
    };

    if (!mounted || isGenerating || isImproving || (idParam && !projectNotFound && !blueprint)) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white"></div>
                <div className="text-zinc-400">{isGenerating ? "Generating your blueprint..." : isImproving ? "Improving blueprint..." : "Loading..."}</div>
            </div>
        );
    }

    if (projectNotFound) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Project not found</h2>
                <p className="text-zinc-400 mb-8">The requested blueprint could not be found or has been deleted.</p>
                <Link
                    href="/dashboard"
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95"
                >
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (!blueprint) {
        return null;
    }

    const { features, techStack, databaseTables, apiRoutes, roadmap, metadata } = blueprint;

    return (
        <>
            {/* Header section */}
            <div className="mb-8">
                <Link
                    href={idParam ? "/dashboard" : "/project/new/details"}
                    className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    {idParam ? "Back to Dashboard" : "Back to Details"}
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                            Blueprint Preview
                        </h1>
                        <p className="text-lg text-zinc-400">
                            Here is the first structured blueprint for your project idea.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                        <button
                            onClick={handleExportZip}
                            className="hidden rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 xl:block"
                        >
                            Export ZIP Package
                        </button>
                        <button
                            onClick={handleExportBundle}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 xl:block"
                        >
                            Export Project Bundle
                        </button>
                        <button
                            onClick={handleExportMarkdown}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 lg:block"
                        >
                            Export Markdown Files
                        </button>
                        <button
                            onClick={handleExport}
                            className="hidden rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95 sm:block"
                        >
                            Export Starter Pack
                        </button>
                        <button
                            onClick={handleRegenerate}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 sm:block"
                        >
                            Regenerate Blueprint
                        </button>
                        {idParam && (
                            <button
                                onClick={handleUpdate}
                                className="hidden rounded-full border border-white/20 bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 active:scale-95 sm:block"
                            >
                                Update Project
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95 sm:block"
                        >
                            Save Blueprint
                        </button>
                    </div>
                </div>
            </div>

            {/* User Input Summary Card */}
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                <div className="space-y-8">
                    {idParam && (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200">
                            You are editing a saved project preview. Saving will create a new blueprint entry.
                        </div>
                    )}
                    {/* App Idea Section */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">App Idea</h3>
                        <textarea
                            value={idea || ""}
                            onChange={(e) => setIdea(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[100px]"
                            placeholder="Enter your app idea..."
                        />
                    </div>

                    {/* Grid for Platform & Business Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Platform</h3>
                            <select
                                value={platform || ""}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full h-[56px] rounded-xl bg-zinc-900/50 px-4 border border-white/10 text-zinc-200 outline-none focus:border-white/30 transition-colors appearance-none font-sans"
                            >
                                <option value="" disabled>Select platform</option>
                                <option value="web">Web App</option>
                                <option value="mobile">Mobile App</option>
                                <option value="desktop">Desktop App</option>
                            </select>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Business Model</h3>
                            <select
                                value={businessModel || ""}
                                onChange={(e) => setBusinessModel(e.target.value)}
                                className="w-full h-[56px] rounded-xl bg-zinc-900/50 px-4 border border-white/10 text-zinc-200 outline-none focus:border-white/30 transition-colors appearance-none font-sans"
                            >
                                <option value="" disabled>Select business model</option>
                                <option value="free">Free Tool</option>
                                <option value="saas">SaaS</option>
                                <option value="marketplace">Marketplace</option>
                                <option value="internal">Internal Tool</option>
                            </select>
                        </div>
                    </div>

                    {/* Target Users */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Target Users</h3>
                        <textarea
                            value={targetUsers || ""}
                            onChange={(e) => setTargetUsers(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[80px]"
                            placeholder="Who will use this app?"
                        />
                    </div>

                    {/* Core Feature */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Core Feature</h3>
                        <textarea
                            value={coreFeature || ""}
                            onChange={(e) => setCoreFeature(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[80px]"
                            placeholder="What is the main feature?"
                        />
                    </div>
                </div>
            </div>

            {/* Improve Blueprint Controls */}
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                <h3 className="text-lg font-semibold tracking-tight text-white mb-2 ml-1">Refine Architecture</h3>
                <p className="text-sm text-zinc-400 mb-6 ml-1">Ask the AI to improve, restructure, or expand upon the current blueprint.</p>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <input
                        type="text"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Add authentication, Optimize for mobile users, Make it more scalable..."
                        className="flex-1 rounded-xl bg-zinc-900/50 px-4 py-3 border border-white/10 text-zinc-200 outline-none focus:border-blue-500/50 transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleImprove();
                            }
                        }}
                    />
                    <button
                        onClick={handleImprove}
                        disabled={isImproving}
                        className="rounded-xl border border-blue-500/50 bg-blue-500/10 px-8 py-3 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 active:scale-95 disabled:opacity-50 sm:w-auto"
                    >
                        ⭐ Improve Blueprint
                    </button>
                </div>
            </div>

            {/* Diff Summary UI */}
            {diffResult && hasAnyChanges(diffResult) && (
                <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                    <h3 className="text-lg font-semibold tracking-tight text-white mb-2 ml-1">Changes from previous blueprint</h3>
                    <p className="text-sm text-zinc-400 mb-6 ml-1">Here is a structural summary of the improvements.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {Object.entries(diffResult).map(([sectionKey, diff]) => {
                            if (diff.added.length === 0 && diff.removed.length === 0) return null;
                            const titleMap: Record<string, string> = {
                                features: "Features",
                                techStack: "Tech Stack",
                                databaseTables: "Database Tables",
                                apiRoutes: "API Routes",
                                roadmap: "Roadmap"
                            };
                            return (
                                <div key={sectionKey} className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">{titleMap[sectionKey] || sectionKey}</h4>
                                    <ul className="space-y-2 text-sm">
                                        {diff.added.map((item: string, i: number) => (
                                            <li key={`add-${i}`} className="flex items-start text-emerald-400">
                                                <span className="mr-2 font-mono mt-0.5">+</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                        {diff.removed.map((item: string, i: number) => (
                                            <li key={`rm-${i}`} className="flex items-start text-rose-400 opacity-80">
                                                <span className="mr-2 font-mono mt-0.5">-</span>
                                                <span className="leading-relaxed line-through">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {diffResult && !hasAnyChanges(diffResult) && (
                <div className="mb-8 rounded-2xl border border-zinc-500/20 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-sm sm:p-8 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
                    <p className="text-sm text-zinc-300">No structural changes detected from this improvement pass.</p>
                </div>
            )}

            {/* Generated Architecture Card */}
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-white mb-4 ml-2">
                    Generated Architecture
                </h2>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                    <div className="space-y-8">

                        {/* Features */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Features</h3>
                            <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                                <ul className="list-inside list-disc space-y-2 text-zinc-300">
                                    {features.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Tech Stack */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Tech Stack</h3>
                                <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5 h-full">
                                    <ul className="list-inside list-disc space-y-2 text-zinc-300">
                                        {techStack.map((item: string, idx: number) => (
                                            <li key={idx} className="leading-relaxed">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Database Tables */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Database Tables</h3>
                                <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5 h-full">
                                    <ul className="list-inside list-disc space-y-2 text-zinc-300 font-mono text-sm">
                                        {databaseTables.map((item: string, idx: number) => (
                                            <li key={idx} className="leading-relaxed">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* API Routes */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">API Routes</h3>
                            <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                                <ul className="list-inside list-disc space-y-2 text-zinc-300 font-mono text-sm">
                                    {apiRoutes.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Development Roadmap */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Development Roadmap</h3>
                            <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                                <ul className="list-inside list-disc space-y-2 text-zinc-300">
                                    {roadmap.map((item: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* AI Source Metadata */}
                    {metadata && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
                                <span className={`h-1.5 w-1.5 rounded-full ${metadata.usedFallback || metadata.provider === "local" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                                Generated using: {metadata.sourceLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Save Button */}
            <div className="mt-8 flex flex-col gap-3 sm:hidden">
                <button
                    onClick={handleExportZip}
                    className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                    Export ZIP Package
                </button>
                <button
                    onClick={handleExportBundle}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Export Project Bundle
                </button>
                <button
                    onClick={handleExportMarkdown}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Export Markdown Files
                </button>
                <button
                    onClick={handleExport}
                    className="w-full rounded-full bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                >
                    Export Starter Pack
                </button>
                <button
                    onClick={handleRegenerate}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Regenerate Blueprint
                </button>
                {idParam && (
                    <button
                        onClick={handleUpdate}
                        className="w-full rounded-full border border-white/20 bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-zinc-700 active:scale-95"
                    >
                        Update Project
                    </button>
                )}
                <button
                    onClick={handleSave}
                    className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95"
                >
                    Save Blueprint
                </button>
            </div>
        </>
    );
}

export default function BlueprintPreview() {
    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center">
                <Suspense fallback={<div className="text-zinc-500">Loading Blueprint...</div>}>
                    <BlueprintContent />
                </Suspense>
            </main>
        </div>
    );
}
