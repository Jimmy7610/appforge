"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import JSZip from "jszip";
import { generateBlueprint } from "@/lib/ai/generateBlueprint";
import { buildStarterPack, ExportInput } from "@/lib/export/buildStarterPack";
import { buildMarkdownFiles } from "@/lib/export/buildMarkdownFiles";
import { buildProjectBundle } from "@/lib/export/buildProjectBundle";

function BlueprintContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const getParam = (key: string) => searchParams.get(key) || undefined;

    const idea = getParam("idea");
    const platform = getParam("platform");
    const businessModel = getParam("businessModel");
    const targetUsers = getParam("targetUsers");
    const coreFeature = getParam("coreFeature");

    const displayMap: Record<string, string | undefined> = {
        web: "Web App",
        mobile: "Mobile App",
        desktop: "Desktop App",
        free: "Free Tool",
        saas: "SaaS",
        marketplace: "Marketplace",
        internal: "Internal Tool"
    };

    const input = {
        idea,
        platform,
        businessModel,
        targetUsers,
        coreFeature
    };

    // Generate blueprint on the fly based on current URL parameters
    const [blueprint, setBlueprint] = useState(() => generateBlueprint(input));

    const handleRegenerate = () => {
        setBlueprint(generateBlueprint(input));
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

            router.push("/dashboard");
        } catch (e) {
            console.error("Failed to save blueprint", e);
        }
    };

    const handleExport = () => {
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
        const bundleData = buildProjectBundle({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const zip = new JSZip();

        zip.file("README.md", bundleData.files["README.md"]);

        const docs = zip.folder("docs");
        docs?.file("PROJECT_SPEC.md", bundleData.files["docs/PROJECT_SPEC.md"]);
        docs?.file("DATABASE_SCHEMA.md", bundleData.files["docs/DATABASE_SCHEMA.md"]);
        docs?.file("API_ROUTES.md", bundleData.files["docs/API_ROUTES.md"]);
        docs?.file("TASKS.md", bundleData.files["docs/TASKS.md"]);

        const app = zip.folder("app");
        app?.file("page.tsx", bundleData.files["app/page.tsx"]);
        app?.file("layout.tsx", bundleData.files["app/layout.tsx"]);

        const dashboard = app?.folder("dashboard");
        dashboard?.file("page.tsx", bundleData.files["app/dashboard/page.tsx"]);

        const components = zip.folder("components");
        const ui = components?.folder("ui");
        ui?.file("button.tsx", bundleData.files["components/ui/button.tsx"]);

        const lib = zip.folder("lib");
        lib?.file("types.ts", bundleData.files["lib/types.ts"]);

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

    return (
        <>
            {/* Header section */}
            <div className="mb-8">
                <Link
                    href="/project/new/details"
                    className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Details
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
                    {/* App Idea Section */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">App Idea</h3>
                        <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                            <p className="text-zinc-200 leading-relaxed">
                                {idea || <span className="text-zinc-500 italic">Not provided</span>}
                            </p>
                        </div>
                    </div>

                    {/* Grid for Platform & Business Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Platform</h3>
                            <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5 flex items-center h-[72px]">
                                <p className="text-zinc-200 font-medium font-sans">
                                    {platform ? (displayMap[platform] || platform) : <span className="text-zinc-500 italic font-normal">Not provided</span>}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Business Model</h3>
                            <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5 flex items-center h-[72px]">
                                <p className="text-zinc-200 font-medium font-sans">
                                    {businessModel ? (displayMap[businessModel] || businessModel) : <span className="text-zinc-500 italic font-normal">Not provided</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Target Users */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Target Users</h3>
                        <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                            <p className="text-zinc-200 leading-relaxed font-sans">
                                {targetUsers || <span className="text-zinc-500 italic">Not provided</span>}
                            </p>
                        </div>
                    </div>

                    {/* Core Feature */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Core Feature</h3>
                        <div className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                            <p className="text-zinc-200 leading-relaxed font-sans">
                                {coreFeature || <span className="text-zinc-500 italic">Not provided</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                                    {blueprint.features.map((item, idx) => (
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
                                        {blueprint.techStack.map((item, idx) => (
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
                                        {blueprint.databaseTables.map((item, idx) => (
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
                                    {blueprint.apiRoutes.map((item, idx) => (
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
                                    {blueprint.roadmap.map((item, idx) => (
                                        <li key={idx} className="leading-relaxed">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
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
