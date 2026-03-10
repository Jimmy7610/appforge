import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 text-white selection:bg-blue-500/30">
      {/* Background glow effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[40rem] w-[40rem] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300 backdrop-blur-md">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-500"></span>
          AppForge Beta
        </div>

        <h1 className="mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Turn your app idea into a full development blueprint
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-zinc-400 sm:text-xl">
          AppForge uses AI to generate features, architecture, database schemas
          and development roadmaps for your next project.
        </p>

        <Link
          href="/dashboard"
          className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95 sm:text-base"
        >
          Start Building
        </Link>
      </main>
    </div>
  );
}