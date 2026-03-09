import type { Blueprint } from "../ai/types";
import type { ExplainBlueprintResult } from "../ai/tasks/types";

export interface ShareBlueprintInput {
    idea?: string;
    inputs: {
        platform?: string;
        businessModel?: string;
        targetUsers?: string;
        coreFeature?: string;
    };
    blueprint: Blueprint;
    explanation?: ExplainBlueprintResult;
}

export interface SharedBlueprintPayload {
    type: "appforge-blueprint";
    version: 1;
    idea: string;
    inputs: {
        platform: string;
        businessModel: string;
        targetUsers: string;
        coreFeature: string;
    };
    blueprint: Blueprint;
    explanation: string | null;
    metadata: import("../ai/types").AIGenerationMetadata | null;
}

// TODO: import shared blueprint
// TODO: share link generation
// TODO: blueprint gallery
// TODO: public blueprint URLs

export function buildShareBlueprint(params: ShareBlueprintInput): SharedBlueprintPayload {
    const { idea, inputs, blueprint, explanation } = params;

    return {
        type: "appforge-blueprint",
        version: 1,
        idea: idea || "",
        inputs: {
            platform: inputs.platform || "",
            businessModel: inputs.businessModel || "",
            targetUsers: inputs.targetUsers || "",
            coreFeature: inputs.coreFeature || ""
        },
        blueprint: blueprint,
        explanation: explanation?.explanation || null,
        metadata: blueprint.metadata || null
    };
}
