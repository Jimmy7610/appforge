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

function pickRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
}

const authOptions = [
    "Email/password authentication",
    "OAuth login with Google and GitHub",
    "Magic link authentication",
    "Passkey-based authentication",
    "SSO integration for enterprise users"
];

const dashboardOptions = [
    "Analytics dashboard with charts",
    "User settings and profile management",
    "Admin panel for managing users",
    "Activity feed and recent actions",
    "Customizable dashboard widgets"
];

const featureEnhancements = [
    "Real-time notifications",
    "Dark mode support",
    "Multi-language support (i18n)",
    "Advanced search with filters",
    "Export data to CSV/PDF",
    "Role-based access control (RBAC)",
    "In-app messaging system"
];

const techStackOptions = [
    "Redis for caching",
    "Stripe for payments",
    "WebSockets for real-time updates",
    "OpenAI integration for AI features",
    "Background jobs with BullMQ",
    "ElasticSearch for advanced search",
    "GraphQL API layer",
    "tRPC for end-to-end type safety"
];

const databaseExtras = [
    "sessions",
    "subscriptions",
    "activity_logs",
    "notifications",
    "teams",
    "user_roles",
    "api_keys",
    "webhooks",
    "audit_logs"
];

const apiPatterns = [
    "GET /api/health - System health check",
    "POST /api/webhooks - External integrations",
    "GET /api/analytics - Dashboard metrics",
    "POST /api/upload - File handling",
    "GET /api/export - Data exporting",
    "POST /api/invite - User invitations",
    "PUT /api/settings - User preferences"
];

const roadmapSteps = {
    phase1: [
        "Set up core repository and CI/CD",
        "Design database schema and run initial migrations",
        "Implement basic authentication flow",
        "Build main layout and navigation",
        "Develop the core MVP functionality"
    ],
    phase2: [
        "Integrate payment gateway",
        "Add real-time features and WebSockets",
        "Implement the user settings panel",
        "Build out the admin dashboard",
        "Add email notifications",
        "Optimize database queries"
    ],
    phase3: [
        "Conduct security audit and penetration testing",
        "Set up monitoring and logging",
        "Implement rate limiting and API security",
        "Add multi-language support",
        "Launch beta program for early access",
        "Scale infrastructure for production traffic"
    ]
};

export function generateBlueprint(input: BlueprintInput): Blueprint {
    const { coreFeature, idea } = input;

    const mainFeature = coreFeature || idea || "Core application functionality";

    const features = [
        mainFeature,
        pickRandom(authOptions),
        pickRandom(dashboardOptions),
        pickRandom(featureEnhancements),
        pickRandom(featureEnhancements)
    ];

    // Base stack plus random additions
    const techStack = [
        "Next.js (App Router)",
        "Tailwind CSS",
        "Supabase (Database & Auth)",
        "TypeScript",
        pickRandom(techStackOptions),
        pickRandom(techStackOptions)
    ];

    // Base tables plus random additions
    const databaseTables = [
        "users",
        "profiles",
        pickRandom(databaseExtras),
        pickRandom(databaseExtras),
        pickRandom(databaseExtras)
    ];

    // Deduplicate array values in case pickRandom picked the same element multiple times
    const uniqueFeatures = Array.from(new Set(features));
    const uniqueTechStack = Array.from(new Set(techStack));
    const uniqueDatabaseTables = Array.from(new Set(databaseTables));

    // Determine some deterministic API routes based on core inputs, then sprinkle random ones
    const apiRoutes = [
        "POST /api/auth/login",
        "POST /api/auth/register",
        "GET /api/user/profile",
        pickRandom(apiPatterns),
        pickRandom(apiPatterns)
    ];

    const uniqueApiRoutes = Array.from(new Set(apiRoutes));

    const roadmap = [
        `Phase 1: ${pickRandom(roadmapSteps.phase1)}`,
        `Phase 2: ${pickRandom(roadmapSteps.phase2)}`,
        `Phase 3: ${pickRandom(roadmapSteps.phase3)}`
    ];

    return {
        features: uniqueFeatures,
        techStack: uniqueTechStack,
        databaseTables: uniqueDatabaseTables,
        apiRoutes: uniqueApiRoutes,
        roadmap
    };
}
