import { Blueprint } from "@/lib/ai/generateBlueprint";

export type ExportInput = {
    idea?: string;
    platform?: string;
    businessModel?: string;
    targetUsers?: string;
    coreFeature?: string;
    blueprint: Blueprint;
    displayMap: Record<string, string | undefined>;
};

export function buildStarterPack(input: ExportInput) {
    const { idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap } = input;

    return {
        README: `# Project Overview\n\n${idea || "No idea provided"}\n\n## Target Users\n${targetUsers || "Not provided"}\n\n## Core Feature\n${coreFeature || "Not provided"}\n\n## Suggested Tech Stack\n${blueprint.techStack.map(t => `- ${t}`).join("\n")}`,
        PROJECT_SPEC: `# Project Specification\n\n**App Idea:**\n${idea || "Not provided"}\n\n**Platform:**\n${platform ? displayMap[platform] || platform : "Not provided"}\n\n**Business Model:**\n${businessModel ? displayMap[businessModel] || businessModel : "Not provided"}\n\n**Target Users:**\n${targetUsers || "Not provided"}\n\n**Core Feature:**\n${coreFeature || "Not provided"}\n\n**Features Summary:**\n${blueprint.features.map(f => `- ${f}`).join("\n")}`,
        DATABASE_SCHEMA: `# Database Schema\n\n${blueprint.databaseTables.map(t => `- ${t}`).join("\n")}`,
        API_ROUTES: `# API Routes\n\n${blueprint.apiRoutes.map(r => `- ${r}`).join("\n")}`,
        TASKS: `# Tasks & Roadmap\n\n## Roadmap\n${blueprint.roadmap.map(r => `- [ ] ${r}`).join("\n")}\n\n## Features to Implement\n${blueprint.features.map(f => `- [ ] ${f}`).join("\n")}`
    };
}
