import { ExportInput } from "./buildStarterPack";

export function buildMarkdownFiles(input: ExportInput) {
    const { idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap } = input;

    return [
        {
            name: "appforge-README.md",
            content: `# ${idea || "Untitled AppForge Project"}\n\n${idea || "No idea provided"}\n\n## Target Users\n${targetUsers || "Not provided"}\n\n## Core Feature\n${coreFeature || "Not provided"}\n\n## Suggested Tech Stack\n${blueprint.techStack.map(t => `- ${t}`).join("\n")}`
        },
        {
            name: "appforge-PROJECT_SPEC.md",
            content: `# Project Specification\n\n**App Idea:**\n${idea || "Not provided"}\n\n**Platform:**\n${platform ? displayMap[platform] || platform : "Not provided"}\n\n**Business Model:**\n${businessModel ? displayMap[businessModel] || businessModel : "Not provided"}\n\n**Target Users:**\n${targetUsers || "Not provided"}\n\n**Core Feature:**\n${coreFeature || "Not provided"}\n\n**Features Summary:**\n${blueprint.features.map(f => `- ${f}`).join("\n")}`
        },
        {
            name: "appforge-DATABASE_SCHEMA.md",
            content: `# Database Schema\n\n${blueprint.databaseTables.map(t => `- ${t}`).join("\n")}`
        },
        {
            name: "appforge-API_ROUTES.md",
            content: `# API Routes\n\n${blueprint.apiRoutes.map(r => `- ${r}`).join("\n")}`
        },
        {
            name: "appforge-TASKS.md",
            content: `# Tasks & Roadmap\n\n## Roadmap\n${blueprint.roadmap.map(r => `- [ ] ${r}`).join("\n")}\n\n## Features to Implement\n${blueprint.features.map(f => `- [ ] ${f}`).join("\n")}`
        }
    ];
}
