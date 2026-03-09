import { Project } from "../ai/types";
import { normalizeProjectVersions } from "./versioning";

const STORAGE_KEY = "appforge_blueprints";

/**
 * Safely loads projects from localStorage, preventing crashes from malformed JSON or unexpected non-array shapes.
 */
export function loadSavedProjects(): Project[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);

        // Ensure it's an array
        if (!Array.isArray(parsed)) {
            console.warn(`[storage] ${STORAGE_KEY} is not an array. Resetting.`);
            return [];
        }

        // Filter out malformed items and normalize
        return parsed
            .filter(p => p && typeof p === "object" && p.id && p.idea)
            .map(p => normalizeProjectVersions(p));

    } catch (e) {
        console.error(`[storage] Failed to parse ${STORAGE_KEY} from localStorage:`, e);
        return []; // Fallback to empty instead of breaking the entire app
    }
}

/**
 * Safely saves projects to localStorage.
 */
export function saveProjects(projects: Project[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
        console.error(`[storage] Failed to save ${STORAGE_KEY} to localStorage:`, e);
    }
}
