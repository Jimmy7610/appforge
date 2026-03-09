import { ExportInput } from "./buildStarterPack";
import { detectFeatures } from "./detectFeatures";
import { buildFeatureModules } from "./buildFeatureModules";
import { buildApiLayer } from "./buildApiLayer";
import { buildDatabaseSchema } from "./buildDatabaseSchema";
import { buildResourceTypes } from "./buildResourceTypes";
import { buildMockData } from "./buildMockData";

export function buildProjectBundle(input: ExportInput) {
    const { idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap } = input;

    const { hasProfile, hasActivity, hasTeam } = detectFeatures(blueprint.features, blueprint.databaseTables);

    const platformLabel = platform ? displayMap[platform] || platform : "Web App";
    const modelLabel = businessModel ? displayMap[businessModel] || businessModel : "SaaS";

    const appLayoutContent = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${idea || "AppForge Project"}",
  description: "${coreFeature ? coreFeature + "." : "Starter project scaffolded by AppForge."} Built for ${targetUsers || "modern teams"}.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}`;

    const appPageContent = `import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <main className="text-center px-6 py-24 max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          ${idea || "Untitled Project"}
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          ${coreFeature || "A powerful new application"} — designed for ${targetUsers || "everyone"}.
        </p>
        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Open Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}`;

    // Build dynamic sidebar links
    const navLinks = [
        { href: "/projects", label: "Projects" },
        { href: "/settings", label: "Settings" },
    ];
    if (hasProfile) navLinks.push({ href: "/profile", label: "Profile" });
    if (hasActivity) navLinks.push({ href: "/activity", label: "Activity" });
    if (hasTeam) navLinks.push({ href: "/team", label: "Team" });

    const navLinksMarkup = navLinks
        .map(l => `          <Link href="${l.href}" className="block text-sm text-gray-400 hover:text-white transition-colors">${l.label}</Link>`)
        .join("\n");

    const dashboardPageContent = `import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { projects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const recentProjects = projects.slice(0, 2);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="hidden w-60 shrink-0 border-r border-white/10 p-6 md:block">
        <h2 className="text-lg font-bold mb-6">${idea || "App"}</h2>
        <nav className="space-y-3">
          <Link href="/dashboard" className="block text-sm font-medium text-white">Dashboard</Link>
${navLinksMarkup}
        </nav>
      </aside>

      <main className="flex-1 p-8 lg:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">${idea || "Dashboard"}</h1>
          <p className="mt-1 text-sm text-gray-400">${coreFeature ? coreFeature + " —" : "Your"} ${platformLabel} for ${targetUsers || "your users"}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <StatCard label="Total Users" value={0} />
          <StatCard label="Platform" value="${platformLabel}" helperText="Target platform" />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-gray-400 hover:text-white transition-colors">View all</Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProjects.map((project: Project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{project.title}</h3>
                    <span className="text-xs text-gray-500 rounded-full bg-white/10 px-2 py-0.5">{project.platform}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{project.coreFeature}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-sm text-gray-500">No projects yet. Create one to get started.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}`;

    const buttonComponentContent = `import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary";

const variantStyles: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={\`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 \${variantStyles[variant]} \${className}\`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";`;

    const typesContent = `export type Project = {
  id: string;
  title: string;
  platform: string;
  businessModel: string;
  targetUsers: string;
  coreFeature: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user";
  createdAt: string;
};

export type DashboardStat = {
  label: string;
  value: number | string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
};`;

    const globalsCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-gray-950 text-white antialiased;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

::selection {
  @apply bg-blue-500/30;
}

* {
  @apply border-white/10;
}`;

    const projectsPageContent = `import { projects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">
            All projects under ${idea || "your workspace"}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <article
              key={project.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
            >
              <div>
                <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                  <time>{new Date(project.createdAt).toLocaleDateString()}</time>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-gray-300">
                    {project.platform}
                  </span>
                </div>
                <h2 className="mb-1 font-semibold text-white">{project.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-2">{project.coreFeature}</p>
              </div>
              <div className="mt-5">
                <button className="w-full rounded-lg bg-white/10 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}`;



    const settingsPageContent = `export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-gray-400 mb-8">
          Configure ${idea || "your application"}.
        </p>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold mb-4">General</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-200">Project Name</p>
                  <p className="text-xs text-gray-500">Visible across the workspace</p>
                </div>
                <input
                  type="text"
                  defaultValue="${idea || "My Project"}"
                  className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-white/20"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-200">Theme</p>
                  <p className="text-xs text-gray-500">Interface colour scheme</p>
                </div>
                <button className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white">Dark</button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold mb-4">Notifications</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-200">Email Alerts</p>
                <p className="text-xs text-gray-500">Receive important updates via email</p>
              </div>
              <button className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-400">Off</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}`;

    const healthRouteContent = `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    project: "${idea || "AppForge Project"}",
    platform: "${platformLabel}",
    timestamp: new Date().toISOString(),
  });
}`;

    const statCardContent = `interface StatCardProps {
  label: string;
  value: string | number;
  helperText?: string;
}

export function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}`;

    // Build the files object with conditional pages
    const files: Record<string, string> = {
        "README.md": `# Project Overview\n\n${idea || "No idea provided"}\n\n## Target Users\n${targetUsers || "Not provided"}\n\n## Core Feature\n${coreFeature || "Not provided"}\n\n## Suggested Tech Stack\n${blueprint.techStack.map(t => `- ${t}`).join("\n")}`,
        "docs/PROJECT_SPEC.md": `# Project Specification\n\n**App Idea:**\n${idea || "Not provided"}\n\n**Platform:**\n${platformLabel}\n\n**Business Model:**\n${modelLabel}\n\n**Target Users:**\n${targetUsers || "Not provided"}\n\n**Core Feature:**\n${coreFeature || "Not provided"}\n\n**Features Summary:**\n${blueprint.features.map(f => `- ${f}`).join("\n")}`,
        "docs/DATABASE_SCHEMA.md": `# Database Schema\n\n${blueprint.databaseTables.map(t => `- ${t}`).join("\n")}`,
        "docs/API_ROUTES.md": `# API Routes\n\n${blueprint.apiRoutes.map(r => `- ${r}`).join("\n")}`,
        "docs/TASKS.md": `# Tasks & Roadmap\n\n## Roadmap\n${blueprint.roadmap.map(r => `- [ ] ${r}`).join("\n")}\n\n## Features to Implement\n${blueprint.features.map(f => `- [ ] ${f}`).join("\n")}`,
        "app/globals.css": globalsCssContent,
        "app/layout.tsx": appLayoutContent,
        "app/page.tsx": appPageContent,
        "app/dashboard/page.tsx": dashboardPageContent,
        "app/projects/page.tsx": projectsPageContent,
        "app/settings/page.tsx": settingsPageContent,
        "app/api/health/route.ts": healthRouteContent,
        "components/ui/button.tsx": buttonComponentContent,
        "components/dashboard/stat-card.tsx": statCardContent,
        "lib/types.ts": typesContent,

    };

    const detectedFeatures = { hasProfile, hasActivity, hasTeam };
    const featureFiles = buildFeatureModules({ idea: idea || "", detectedFeatures });
    const apiFiles = buildApiLayer({ idea: idea || "", apiRoutes: blueprint.apiRoutes, detectedFeatures });
    const schemaFiles = buildDatabaseSchema({ databaseTables: blueprint.databaseTables });
    const resourceFiles = buildResourceTypes({ blueprint, detectedFeatures });
    const mockFiles = buildMockData({ idea: idea || "", platformLabel, modelLabel, targetUsers: targetUsers || "", coreFeature: coreFeature || "", blueprint, detectedFeatures });
    Object.assign(files, featureFiles, apiFiles, schemaFiles, resourceFiles, mockFiles);

    return {
        projectName: idea || "appforge-project",
        idea: idea || "",
        platform: platform || "",
        businessModel: businessModel || "",
        targetUsers: targetUsers || "",
        coreFeature: coreFeature || "",
        generatedBlueprint: blueprint,
        files
    };
}
