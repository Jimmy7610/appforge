import { Project, Blueprint, BlueprintVersion, AIGenerationMetadata } from "../ai/types";

/**
 * Ensures a project has a valid versions array and handles backward compatibility.
 * If no versions exist, it initializes with the current generatedBlueprint as v1.
 */
export function normalizeProjectVersions(project: Project): Project {
    if (project.versions && project.versions.length > 0) {
        return project;
    }

    // Initialize with the current blueprint as v1 if no versions exist
    const initialVersion: BlueprintVersion = {
        id: crypto.randomUUID(),
        label: "v1",
        createdAt: project.createdAt || new Date().toISOString(),
        blueprint: project.generatedBlueprint,
        explanation: null,
        diagram: null,
        metadata: project.generatedBlueprint.metadata || null
    };

    return {
        ...project,
        versions: [initialVersion]
    };
}

/**
 * Creates a new version object from the provided blueprint and optional context.
 */
export function createBlueprintVersion(
    project: Project,
    blueprint: Blueprint,
    explanation?: string | null,
    diagram?: string | null,
    metadata?: AIGenerationMetadata | null
): BlueprintVersion {
    const nextVersionNumber = (project.versions?.length || 0) + 1;

    return {
        id: crypto.randomUUID(),
        label: `v${nextVersionNumber}`,
        createdAt: new Date().toISOString(),
        blueprint,
        explanation,
        diagram,
        metadata
    };
}

/**
 * Appends a new version to the project, ensuring consistency.
 */
export function appendBlueprintVersion(project: Project, version: BlueprintVersion): Project {
    const normalized = normalizeProjectVersions(project);
    return {
        ...normalized,
        versions: [...(normalized.versions || []), version]
    };
}

/**
 * Prepares the state for restoring a specific version.
 */
export function restoreBlueprintVersion(versionId: string, project: Project): BlueprintVersion | null {
    if (!project.versions) return null;
    return project.versions.find(v => v.id === versionId) || null;
}
