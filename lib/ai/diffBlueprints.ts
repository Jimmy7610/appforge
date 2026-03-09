import type { Blueprint } from "./types";

export interface ArrayDiff {
    added: string[];
    removed: string[];
}

export type BlueprintDiff = {
    features: ArrayDiff;
    techStack: ArrayDiff;
    databaseTables: ArrayDiff;
    apiRoutes: ArrayDiff;
    roadmap: ArrayDiff;
};

// TODO: side-by-side diff view
// TODO: change highlighting inside section cards
// TODO: version history navigation
// TODO: accept/reject individual changes

function computeArrayDiff(oldArr: string[], newArr: string[]): ArrayDiff {
    // Perform simple case-insensitive matching and trim white space
    const normalize = (s: string) => s.toLowerCase().trim();

    const oldMap = new Map(oldArr.map(item => [normalize(item), item]));
    const newMap = new Map(newArr.map(item => [normalize(item), item]));

    const added: string[] = [];
    const removed: string[] = [];

    // Find things in new that aren't in old
    for (const [normKey, originalItem] of newMap.entries()) {
        if (!oldMap.has(normKey)) {
            added.push(originalItem);
        }
    }

    // Find things in old that aren't in new
    for (const [normKey, originalItem] of oldMap.entries()) {
        if (!newMap.has(normKey)) {
            removed.push(originalItem);
        }
    }

    return { added, removed };
}

export function diffBlueprints(previousBlueprint: Blueprint, nextBlueprint: Blueprint): BlueprintDiff {
    // Defensive extraction to empty arrays if undefined
    return {
        features: computeArrayDiff(previousBlueprint.features || [], nextBlueprint.features || []),
        techStack: computeArrayDiff(previousBlueprint.techStack || [], nextBlueprint.techStack || []),
        databaseTables: computeArrayDiff(previousBlueprint.databaseTables || [], nextBlueprint.databaseTables || []),
        apiRoutes: computeArrayDiff(previousBlueprint.apiRoutes || [], nextBlueprint.apiRoutes || []),
        roadmap: computeArrayDiff(previousBlueprint.roadmap || [], nextBlueprint.roadmap || [])
    };
}

export function hasAnyChanges(diff: BlueprintDiff): boolean {
    return Object.values(diff).some(section => section.added.length > 0 || section.removed.length > 0);
}
