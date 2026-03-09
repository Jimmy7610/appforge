import { DetectedFeatures } from "./detectFeatures";

interface BuildResourceTypesInput {
    blueprint: {
        databaseTables: string[];
        apiRoutes: string[];
    };
    detectedFeatures: DetectedFeatures;
}

function normalize(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

function extractApiSlugs(apiRoutes: string[]): string[] {
    const slugs: string[] = [];
    for (const route of apiRoutes) {
        const match = route.match(/\/api\/([a-z_-]+)/i);
        if (match) {
            const slug = normalize(match[1]);
            if (slug) slugs.push(slug);
        }
    }
    return slugs;
}

export function buildResourceTypes({ blueprint, detectedFeatures }: BuildResourceTypesInput): Record<string, string> {
    const tableNames = blueprint.databaseTables.map(normalize).filter(Boolean);
    const apiSlugs = extractApiSlugs(blueprint.apiRoutes);

    const allNames = Array.from(new Set([...tableNames, ...apiSlugs])).sort();

    if (!allNames.length) return {};

    const resourceNamesLiteral = allNames.map(n => `  "${n}"`).join(",\n");

    const apiResourceUnion = apiSlugs.length
        ? Array.from(new Set(apiSlugs)).sort().map(s => `  | "${s}"`).join("\n")
        : `  | never`;

    const content = `// Auto-generated resource types
// Derived from blueprint database tables, API routes, and detected features

export const resourceNames = [
${resourceNamesLiteral},
] as const;

export type ResourceName = (typeof resourceNames)[number];

export type ApiResource =
${apiResourceUnion};

export type FeatureFlagMap = {
  hasProfile: ${detectedFeatures.hasProfile};
  hasActivity: ${detectedFeatures.hasActivity};
  hasTeam: ${detectedFeatures.hasTeam};
};
`;

    return { "lib/generated/resources.ts": content };
}
