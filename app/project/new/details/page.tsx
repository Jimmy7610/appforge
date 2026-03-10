"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ProjectDetailsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const idea = searchParams.get("idea");

    const [platform, setPlatform] = useState("web");
    const [businessModel, setBusinessModel] = useState("saas");
    const [targetUsers, setTargetUsers] = useState("");
    const [coreFeature, setCoreFeature] = useState("");

    const handleGenerate = () => {
        if (!targetUsers.trim() || !coreFeature.trim()) {
            return;
        }

        const params = new URLSearchParams();
        if (idea) params.set("idea", idea);
        params.set("platform", platform);
        params.set("businessModel", businessModel);
        params.set("targetUsers", targetUsers.trim());
        params.set("coreFeature", coreFeature.trim());

        router.push(`/project/blueprint?${params.toString()}`);
    };

    return (
        <>
            <div className="mb-6 grid gap-6 sm:grid-cols-2">
                {/* App Idea (Read-only from query) */}
                <div className="flex flex-col gap-3 sm:col-span-2">
                    <label htmlFor="idea" className="text-sm font-medium text-zinc-200">
                        App Idea
                    </label>
                    <textarea
                        id="idea"
                        readOnly
                        rows={3}
                        value={idea || "No app idea provided"}
                        className={`w-full resize-none rounded-xl border border-white/10 bg-zinc-950/50 p-4 outline-none transition-all ${!idea ? "text-zinc-500 italic" : "text-zinc-300"
                            }`}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="platform" className="text-sm font-medium text-zinc-200">
                        Platform
                    </label>
                    <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-white outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all [&>*]:bg-zinc-900"
                    >
                        <option value="web">Web App</option>
                        <option value="mobile">Mobile App</option>
                        <option value="desktop">Desktop App</option>
                    </select>
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="businessModel" className="text-sm font-medium text-zinc-200">
                        Business Model
                    </label>
                    <select
                        id="businessModel"
                        value={businessModel}
                        onChange={(e) => setBusinessModel(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-white outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all [&>*]:bg-zinc-900"
                    >
                        <option value="free">Free Tool</option>
                        <option value="saas">SaaS</option>
                        <option value="marketplace">Marketplace</option>
                        <option value="internal">Internal Tool</option>
                    </select>
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2">
                    <label htmlFor="targetUsers" className="text-sm font-medium text-zinc-200">
                        Target Users
                    </label>
                    <input
                        id="targetUsers"
                        type="text"
                        value={targetUsers}
                        onChange={(e) => setTargetUsers(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-white placeholder-zinc-500 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                        placeholder="Example: indie developers, remote teams, content creators"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:col-span-2">
                    <label htmlFor="coreFeature" className="text-sm font-medium text-zinc-200">
                        Core Feature
                    </label>
                    <input
                        id="coreFeature"
                        type="text"
                        value={coreFeature}
                        onChange={(e) => setCoreFeature(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-white placeholder-zinc-500 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                        placeholder="Example: habit tracking, team collaboration, AI summarization"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleGenerate}
                    className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Blueprint
                </button>
            </div>
        </>
    );
}

export default function ProjectDetails() {
    return (
        <div className="flex flex-col text-white selection:bg-blue-500/30">
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center">

                {/* Header section */}
                <div className="mb-8">
                    <Link
                        href="/project/new"
                        className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Project Details
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Answer a few quick questions so AppForge can generate a better blueprint.
                    </p>
                </div>

                {/* Form section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm sm:p-8">
                    <Suspense fallback={<div className="text-zinc-500">Loading form...</div>}>
                        <ProjectDetailsForm />
                    </Suspense>
                </div>

            </main>
        </div>
    );
}
