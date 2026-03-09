import { DetectedFeatures } from "./detectFeatures";

interface BuildMockDataInput {
    idea: string;
    platformLabel: string;
    modelLabel: string;
    targetUsers: string;
    coreFeature: string;
    blueprint: {
        apiRoutes: string[];
        databaseTables: string[];
    };
    detectedFeatures: DetectedFeatures;
}

export function buildMockData({
    idea,
    platformLabel,
    modelLabel,
    targetUsers,
    coreFeature,
    blueprint,
    detectedFeatures,
}: BuildMockDataInput): Record<string, string> {
    const allText = [...blueprint.apiRoutes, ...blueprint.databaseTables]
        .map(s => s.toLowerCase())
        .join(" ");
    const hasNotifications = /notification|alert/.test(allText);
    const hasUsers = /user|profile|account/.test(allText);

    // Base projects array (always included)
    const sections: string[] = [
        `import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "1",
    title: "${idea || "Core Platform"}",
    platform: "${platformLabel}",
    businessModel: "${modelLabel}",
    targetUsers: "${targetUsers || "General users"}",
    coreFeature: "${coreFeature || "Main application feature"}",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "${idea ? idea + " v2" : "Mobile Companion"}",
    platform: "Mobile App",
    businessModel: "Free Tool",
    targetUsers: "${targetUsers || "Mobile users"}",
    coreFeature: "Companion app with push notifications and offline support",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "3",
    title: "${idea ? idea + " Admin" : "Admin Dashboard"}",
    platform: "Web App",
    businessModel: "Internal Tool",
    targetUsers: "Team administrators",
    coreFeature: "Analytics dashboard with user management and reporting",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];`,
    ];

    // Optional: team members
    if (detectedFeatures.hasTeam) {
        sections.push(`
export const teamMembers = [
  { id: "1", name: "Project Owner", email: "owner@example.com", role: "Admin", initials: "PO" },
  { id: "2", name: "Developer", email: "dev@example.com", role: "Editor", initials: "DE" },
  { id: "3", name: "Designer", email: "design@example.com", role: "Viewer", initials: "DS" },
];`);
    }

    // Optional: activity items
    if (detectedFeatures.hasActivity) {
        sections.push(`
export const activityItems = [
  { id: "1", action: "Project created", target: "${idea || "New Project"}", time: "Just now" },
  { id: "2", action: "Blueprint generated", target: "Version 1.0", time: "2 min ago" },
  { id: "3", action: "Settings updated", target: "Notifications", time: "1 hr ago" },
  { id: "4", action: "Bundle exported", target: "project-bundle.zip", time: "3 hrs ago" },
];`);
    }

    // Optional: notifications
    if (hasNotifications) {
        sections.push(`
export const notifications = [
  { id: "1", message: "Welcome to ${idea || "the platform"}!", read: true, createdAt: new Date().toISOString() },
  { id: "2", message: "Your project blueprint is ready.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", message: "New team member joined.", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
];`);
    }

    // Optional: users
    if (hasUsers) {
        sections.push(`
export const users = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin" as const, createdAt: new Date().toISOString() },
  { id: "2", email: "user@example.com", name: "Regular User", role: "user" as const, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];`);
    }

    return { "lib/mock-data.ts": sections.join("\n") };
}
