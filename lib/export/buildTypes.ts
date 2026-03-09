import { DetectedFeatures } from "./detectFeatures";

interface BuildTypesInput {
    blueprint: {
        apiRoutes: string[];
        databaseTables: string[];
    };
    detectedFeatures: DetectedFeatures;
}

export function buildTypes({ blueprint, detectedFeatures }: BuildTypesInput): Record<string, string> {
    const allText = [...blueprint.apiRoutes, ...blueprint.databaseTables]
        .map(s => s.toLowerCase())
        .join(" ");
    const hasNotifications = /notification|alert/.test(allText);
    const hasUsers = /user|profile|account/.test(allText);

    const sections: string[] = [];

    // Always included
    sections.push(`export type Project = {
  id: string;
  title: string;
  platform: string;
  businessModel: string;
  targetUsers: string;
  coreFeature: string;
  createdAt: string;
};`);

    if (hasUsers) {
        sections.push(`export type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user";
  createdAt: string;
};`);
    }

    sections.push(`export type DashboardStat = {
  label: string;
  value: number | string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
};`);

    // Conditional types
    if (detectedFeatures.hasTeam) {
        sections.push(`export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};`);
    }

    if (detectedFeatures.hasActivity) {
        sections.push(`export type ActivityItem = {
  id: string;
  action: string;
  target: string;
  time: string;
};`);
    }

    if (hasNotifications) {
        sections.push(`export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};`);
    }

    return { "lib/types.ts": sections.join("\n\n") + "\n" };
}
