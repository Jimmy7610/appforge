import { DetectedFeatures } from "./detectFeatures";

interface BuildApiLayerInput {
    idea: string;
    apiRoutes: string[];
    detectedFeatures: DetectedFeatures;
}

const routeConfigs: Record<string, { resource: string; payloadKey: string }> = {
    projects: { resource: "projects", payloadKey: "data" },
    team: { resource: "team", payloadKey: "members" },
    activity: { resource: "activity", payloadKey: "activity" },
    profile: { resource: "profile", payloadKey: "profile" },
    notifications: { resource: "notifications", payloadKey: "notifications" },
    users: { resource: "users", payloadKey: "users" },
};

function makeHandler(resource: string, payloadKey: string): string {
    const empty = payloadKey === "profile" ? "null" : "[]";

    return `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ${payloadKey}: ${empty},
    resource: "${resource}",
    status: "ok",
  });
}
`;
}

export function buildApiLayer({ idea, apiRoutes, detectedFeatures }: BuildApiLayerInput): Record<string, string> {
    const files: Record<string, string> = {};

    // Collect route slugs present in blueprint.apiRoutes (e.g. "GET /api/projects" -> "projects")
    const mentionedSlugs = new Set<string>();
    for (const route of apiRoutes) {
        const lower = route.toLowerCase();
        for (const slug of Object.keys(routeConfigs)) {
            if (lower.includes(`/api/${slug}`)) {
                mentionedSlugs.add(slug);
            }
        }
    }

    // Feature-detected routes are added automatically
    if (detectedFeatures.hasTeam) mentionedSlugs.add("team");
    if (detectedFeatures.hasActivity) mentionedSlugs.add("activity");
    if (detectedFeatures.hasProfile) mentionedSlugs.add("profile");

    for (const slug of mentionedSlugs) {
        const config = routeConfigs[slug];
        // Skip health — it's handled separately in buildProjectBundle
        if (slug === "health") continue;
        files[`app/api/${slug}/route.ts`] = makeHandler(config.resource, config.payloadKey);
    }

    return files;
}
