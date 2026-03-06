export type BlueprintInput = {
    idea?: string;
    platform?: string;
    businessModel?: string;
    targetUsers?: string;
    coreFeature?: string;
};

export type Blueprint = {
    features: string[];
    techStack: string[];
    databaseTables: string[];
    apiRoutes: string[];
    roadmap: string[];
};

export function generateBlueprint(data: BlueprintInput): Blueprint {
    // Mock logic based on input for now, until actual AI is integrated.

    const techStack = ["Next.js", "Tailwind CSS", "TypeScript"];

    if (data.platform === "mobile") {
        techStack.push("React Native", "Expo");
    } else if (data.platform === "desktop") {
        techStack.push("Electron");
    } else {
        techStack.push("Supabase");
    }

    const features = [
        "User authentication",
        data.coreFeature ? `Core: ${data.coreFeature}` : "Main dashboard",
        "Settings and profile management",
    ];

    if (data.businessModel === "saas") {
        features.push("Subscription billing");
    }

    return {
        features,
        techStack,
        databaseTables: [
            "users",
            "profiles",
            "subscriptions",
            "settings"
        ],
        apiRoutes: [
            "POST /api/auth/register",
            "POST /api/auth/login",
            "GET /api/user/profile",
            "PUT /api/user/profile"
        ],
        roadmap: [
            "Phase 1: Core functionality and infrastructure setup",
            "Phase 2: Implementing minimum viable product features",
            "Phase 3: User onboarding and experience improvements",
            "Phase 4: Launch and scale"
        ]
    };
}
