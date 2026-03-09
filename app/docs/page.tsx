import { Metadata } from 'next';
import {
    Terminal,
    Workflow,
    FileCode2,
    Sparkles,
    GitMerge,
    Download,
    Layers,
    Eye,
    CheckCircle2,
    BookOpen
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Documentation | AppForge',
    description: 'Learn how to use AppForge to architect, refine, and scaffold your applications.',
};

export default function DocsPage() {
    return (
        <div className="bg-zinc-950 text-zinc-300 min-h-screen selection:bg-blue-500/30">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

                {/* Header Section */}
                <header className="mb-16 border-b border-zinc-800 pb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 mb-6 text-sm font-medium text-blue-400">
                        <BookOpen className="h-4 w-4" />
                        Official Documentation
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                        AppForge Documentation
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                        Everything you need to know about generating, refining, and exporting
                        production-ready application architectures with AI.
                    </p>
                </header>

                {/* 1. What is AppForge */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Terminal className="h-5 w-5 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">1. What is AppForge?</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        <strong className="text-white">AppForge</strong> is an AI-powered architecture generation platform designed specifically for software developers and system architects. Unlike traditional code generation tools that focus on writing single functions, AppForge focuses on the <em>macro structure</em> of your application.
                    </p>
                    <p className="mb-4 leading-relaxed">
                        By analyzing your core idea, target platform, and business model, AppForge designs complete architecture blueprints outlining features, database schemas, API routes, and tech stack choices. From this high-level blueprint, it can then scaffold complete project structures.
                    </p>
                </section>

                {/* 2. Core Workflow */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Workflow className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">2. Core Workflow</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[
                            { step: '1', title: 'Ideation', desc: 'Describe your app idea, platform, and target users.' },
                            { step: '2', title: 'Generation', desc: 'AI generates a detailed architectural blueprint.' },
                            { step: '3', title: 'Refinement', desc: 'Critique, chat, and iteratively improve the design.' },
                            { step: '4', title: 'Scaffolding', desc: 'Export source code or view file previews instantly.' },
                        ].map((s) => (
                            <div key={s.step} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:bg-zinc-800/50 transition-colors">
                                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">
                                    {s.step}
                                </div>
                                <h3 className="font-medium text-white mb-2">{s.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Blueprints */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <FileCode2 className="h-5 w-5 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">3. Blueprints</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        The <strong>Blueprint</strong> is the central schema of AppForge. It represents the DNA of your application in a structured format containing:
                    </p>
                    <ul className="mb-6 space-y-3 list-disc pl-6">
                        <li><strong className="text-zinc-200">Tech Stack:</strong> Recommended frameworks, libraries, and hosting solutions.</li>
                        <li><strong className="text-zinc-200">Database Tables:</strong> The relational schema defining your application's data layer.</li>
                        <li><strong className="text-zinc-200">API Routes:</strong> Defined endpoints handling your core business logic.</li>
                        <li><strong className="text-zinc-200">Roadmap:</strong> A step-by-step path detailing how to build the application.</li>
                    </ul>
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-500">
                            blueprint.json
                        </div>
                        <pre className="p-4 bg-zinc-950/50 text-sm font-mono overflow-x-auto text-indigo-300/80">
                            {`{
  "features": ["User Authentication", "Dashboard", ...],
  "techStack": ["Next.js", "PostgreSQL", "TailwindCSS"],
  "databaseTables": ["users", "teams", "workspaces"],
  "apiRoutes": ["POST /api/auth/login", "GET /api/users"]
}`}
                        </pre>
                    </div>
                </section>

                {/* 4. Architecture Critique */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <CheckCircle2 className="h-5 w-5 text-teal-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">4. Architecture Critique</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        To ensure your blueprint is robust, AppForge includes an integrated Critique system. By running a critique pass, the AI acts as a <em>Senior Staff Engineer</em>, reviewing your blueprint for potential bottlenecks, security flaws, and scalability issues.
                    </p>
                    <p className="leading-relaxed">
                        Running a critique does not modify your blueprint. Instead, it generates a comprehensive audit report detailing warnings, critical observations, and actionable advice that you can choose to apply later.
                    </p>
                </section>

                {/* 5. Architecture Suggestions */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">5. Architecture Suggestions</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        The platform automatically generates contextual, one-click suggestions to improve your blueprint based on its current state.
                        If you generated a basic CRUD app, suggestions might propose adding a caching layer (Redis) or optimizing for offline capabilities (IndexedDB).
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-200">
                        <strong>Pro Tip:</strong> Suggestions are context-aware. If you change your business model to "SaaS", suggestions will pivot to recommend billing integration architectures like Stripe or LemonSqueezy.
                    </div>
                </section>

                {/* 6. Refine with Presets */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <GitMerge className="h-5 w-5 text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">6. Refine with Presets</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        Instead of manually typing architectural modification requests, you can apply engineered <strong>Preset Passes</strong>.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { name: "Security Pass", desc: "Adds rate limiting, JWT strategies, and basic OWASP protections." },
                            { name: "Scalability Pass", desc: "Introduces caching layers, database indexing, and CDN integration." },
                            { name: "Mobile First Pass", desc: "Updates tech stack and routing for mobile optimization." },
                            { name: "Cost Optimization", desc: "Swaps enterprise tech for free or open-source local equivalents." }
                        ].map((p) => (
                            <div key={p.name} className="border border-zinc-800 bg-zinc-900 rounded-lg p-4">
                                <strong className="text-white block mb-1">{p.name}</strong>
                                <span className="text-zinc-400 text-sm">{p.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7. Architecture Diagrams */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Layers className="h-5 w-5 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">7. Architecture Diagrams</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        AppForge converts theoretical blueprints into visual logic using <strong>Mermaid.js</strong>.
                        By clicking "Generate Diagram", the platform visualizes the request flow across your frontend clients, API layer, databases, and third-party services.
                    </p>
                    <p className="leading-relaxed">
                        These diagrams are live-rendered within the dashboard and can be instantly exported as SVG or PNG assets for inclusion in your pitch decks, READMEs, or investor documents.
                    </p>
                </section>

                {/* 8. Code Preview */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Eye className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">8. Code Preview</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        Before committing to a full download, you can enter <strong>Project Preview</strong> mode.
                        This mode spins up an in-browser IDE-like experience showing the complete directory tree of your project based on the active blueprint.
                    </p>
                    <ul className="mb-4 space-y-2 list-disc pl-6 text-zinc-400">
                        <li>Review route implementations (e.g., <code className="text-zinc-300">app/api/route.ts</code>)</li>
                        <li>Inspect database schema definitions (e.g., <code className="text-zinc-300">lib/schema.ts</code>)</li>
                        <li>Verify component structuring setup</li>
                    </ul>
                </section>

                {/* 9. Exporting Projects */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Download className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">9. Exporting Projects</h2>
                    </div>
                    <p className="mb-4 leading-relaxed">
                        Once your architecture is perfectly refined, AppForge provides multiple export pathways:
                    </p>
                    <div className="space-y-4">
                        <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-xl">
                            <strong className="text-white">Full Project ZIP</strong>
                            <p className="text-sm text-zinc-400 mt-1">Downloads a complete, scaffolded Next.js codebase containing your routes, schema, and layout. Unzip and run <code className="text-blue-400">npm install</code>.</p>
                        </div>
                        <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-xl">
                            <strong className="text-white">Documentation Markdown</strong>
                            <p className="text-sm text-zinc-400 mt-1">Downloads a suite of <code className="text-blue-400">.md</code> files (README, API_ROUTES, TASKS) explicitly meant for pasting into cursor or your IDE's AI context.</p>
                        </div>
                        <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-xl">
                            <strong className="text-white">Shareable JSON Payload</strong>
                            <p className="text-sm text-zinc-400 mt-1">Standardized JSON snapshot of the blueprint that completely reconstructs the state if copied into another AppForge environment.</p>
                        </div>
                    </div>
                </section>

                {/* 10. Best Practices */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">10. Best Practices</h2>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8">
                        <ol className="space-y-6 list-decimal pl-6">
                            <li className="pl-2">
                                <strong className="text-white">Start Broad, Narrow Later:</strong> Begin with a generic idea. Let the AI generate the initial blueprint, and then use the Refine input to specialize specific domains (like "Add a vector database for embeddings").
                            </li>
                            <li className="pl-2">
                                <strong className="text-white">Critique Before Exporting:</strong> Always run an Architecture Critique before exporting your code. The AI often spots missing authentication routes or mismatched datatypes that you overlooked.
                            </li>
                            <li className="pl-2">
                                <strong className="text-white">Use "Ask the Architect":</strong> If you don't understand why a specific technology was chosen (e.g. why TRPC over strict REST), use the chat interface to ask for justification. The architect has full context of the current blueprint version.
                            </li>
                            <li className="pl-2">
                                <strong className="text-white">Version Control:</strong> Treat your blueprints like code. If you make a sweeping refinement change that you don't like, AppForge stores full historical versions of your dashboard—just hit "Restore Version".
                            </li>
                        </ol>
                    </div>
                </section>

            </div>
        </div>
    );
}
