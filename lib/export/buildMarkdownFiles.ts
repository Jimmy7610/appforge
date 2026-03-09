import { ExportInput } from "./buildStarterPack";

export function buildMarkdownFiles(input: ExportInput) {
    const { idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap } = input;

    const tStack = Array.isArray(blueprint.techStack) ? blueprint.techStack : [];
    const features = Array.isArray(blueprint.features) ? blueprint.features : [];
    const tables = Array.isArray(blueprint.databaseTables) ? blueprint.databaseTables : [];
    const routes = Array.isArray(blueprint.apiRoutes) ? blueprint.apiRoutes : [];
    const roadmap = Array.isArray(blueprint.roadmap) ? blueprint.roadmap : [];

    return [
        {
            name: "appforge-README.md",
            content: `# ${idea || "Untitled AppForge Project"}\n\n${idea || "No idea provided"}\n\n## Target Users\n${targetUsers || "Not provided"}\n\n## Core Feature\n${coreFeature || "Not provided"}\n\n## Suggested Tech Stack\n${tStack.map(t => `- ${t}`).join("\n")}`
        },
        {
            name: "appforge-PROJECT_SPEC.md",
            content: `# Project Specification\n\n**App Idea:**\n${idea || "Not provided"}\n\n**Platform:**\n${platform ? displayMap[platform] || platform : "Not provided"}\n\n**Business Model:**\n${businessModel ? displayMap[businessModel] || businessModel : "Not provided"}\n\n**Target Users:**\n${targetUsers || "Not provided"}\n\n**Core Feature:**\n${coreFeature || "Not provided"}\n\n**Features Summary:**\n${features.map(f => `- ${f}`).join("\n")}`
        },
        {
            name: "appforge-DATABASE_SCHEMA.md",
            content: `# Database Schema\n\n${tables.map(t => `- ${t}`).join("\n")}`
        },
        {
            name: "appforge-API_ROUTES.md",
            content: `# API Routes\n\n${routes.map(r => `- ${r}`).join("\n")}`
        },
        {
            name: "appforge-TASKS.md",
            content: `# Tasks & Roadmap\n\n## Roadmap\n${roadmap.map(r => `- [ ] ${r}`).join("\n")}\n\n## Features to Implement\n${features.map(f => `- [ ] ${f}`).join("\n")}`
        }
    ];
}
