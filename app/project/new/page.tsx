"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProject() {
    const [idea, setIdea] = useState("");
    const router = useRouter();

    const handleContinue = () => {
        if (idea.trim()) {
            router.push(`/project/new/details?idea=${encodeURIComponent(idea.trim())}`);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white selection:bg-blue-500/30">
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center">

                {/* Header section */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Create Project
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Describe your app idea and AppForge will turn it into a development blueprint.
                    </p>
                </div>

                {/* Form section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm sm:p-8">
                    <div className="mb-6 flex flex-col gap-3">
                        <label htmlFor="idea" className="text-sm font-medium text-zinc-200">
                            App Idea
                        </label>
                        <textarea
                            id="idea"
                            rows={6}
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-white placeholder-zinc-500 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all resize-none"
                            placeholder="Example: Build a SaaS habit tracker for remote teams"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleContinue}
                            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
