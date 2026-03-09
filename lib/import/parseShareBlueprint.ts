import type { SharedBlueprintPayload } from "../export/buildShareBlueprint";

export function parseShareBlueprint(json: any): SharedBlueprintPayload {
    if (!json || typeof json !== "object") {
        throw new Error("Invalid structure: Not a JSON object");
    }

    if (json.type !== "appforge-blueprint") {
        throw new Error("Invalid structure: Missing or incorrect 'type' field. Expected 'appforge-blueprint'.");
    }

    if (json.version !== 1) {
        throw new Error("Unsupported version: Only version 1 is supported.");
    }

    if (!json.blueprint || typeof json.blueprint !== "object") {
        throw new Error("Invalid structure: Missing 'blueprint' object.");
    }

    // Safely parse lists with fallbacks
    const safeBlueprint = {
        features: Array.isArray(json.blueprint.features) ? json.blueprint.features : [],
        techStack: Array.isArray(json.blueprint.techStack) ? json.blueprint.techStack : [],
        databaseTables: Array.isArray(json.blueprint.databaseTables) ? json.blueprint.databaseTables : [],
        apiRoutes: Array.isArray(json.blueprint.apiRoutes) ? json.blueprint.apiRoutes : [],
        roadmap: Array.isArray(json.blueprint.roadmap) ? json.blueprint.roadmap : [],
        metadata: typeof json.blueprint.metadata === "object" ? json.blueprint.metadata : (json.metadata || null)
    };

    return {
        type: "appforge-blueprint",
        version: 1,
        idea: typeof json.idea === "string" ? json.idea : "",
        inputs: {
            platform: typeof json.inputs?.platform === "string" ? json.inputs.platform : "",
            businessModel: typeof json.inputs?.businessModel === "string" ? json.inputs.businessModel : "",
            targetUsers: typeof json.inputs?.targetUsers === "string" ? json.inputs.targetUsers : "",
            coreFeature: typeof json.inputs?.coreFeature === "string" ? json.inputs.coreFeature : ""
        },
        blueprint: safeBlueprint,
        explanation: typeof json.explanation === "string" ? json.explanation : null,
        metadata: typeof json.metadata === "object" ? json.metadata : null
    };
}
