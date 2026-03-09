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

    const tStack = Array.isArray(blueprint.techStack) ? blueprint.techStack : [];
    const features = Array.isArray(blueprint.features) ? blueprint.features : [];
    const tables = Array.isArray(blueprint.databaseTables) ? blueprint.databaseTables : [];
    const routes = Array.isArray(blueprint.apiRoutes) ? blueprint.apiRoutes : [];
    const roadmap = Array.isArray(blueprint.roadmap) ? blueprint.roadmap : [];

    return {
        README: `# Project Overview\n\n${idea || "No idea provided"}\n\n## Target Users\n${targetUsers || "Not provided"}\n\n## Core Feature\n${coreFeature || "Not provided"}\n\n## Suggested Tech Stack\n${tStack.map(t => `- ${t}`).join("\n")}`,
        PROJECT_SPEC: `# Project Specification\n\n**App Idea:**\n${idea || "Not provided"}\n\n**Platform:**\n${platform ? displayMap[platform] || platform : "Not provided"}\n\n**Business Model:**\n${businessModel ? displayMap[businessModel] || businessModel : "Not provided"}\n\n**Target Users:**\n${targetUsers || "Not provided"}\n\n**Core Feature:**\n${coreFeature || "Not provided"}\n\n**Features Summary:**\n${features.map(f => `- ${f}`).join("\n")}`,
        DATABASE_SCHEMA: `# Database Schema\n\n${tables.map(t => `- ${t}`).join("\n")}`,
        API_ROUTES: `# API Routes\n\n${routes.map(r => `- ${r}`).join("\n")}`,
        TASKS: `# Tasks & Roadmap\n\n## Roadmap\n${roadmap.map(r => `- [ ] ${r}`).join("\n")}\n\n## Features to Implement\n${features.map(f => `- [ ] ${f}`).join("\n")}`
    };
}
