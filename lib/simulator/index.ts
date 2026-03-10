import type { Blueprint, BlueprintInput } from "@/lib/ai/types";

export interface SimulationResult {
    userFlow: string[];
    systemFlow: string[];
    dataFlow: string[];
    observations: string[];
}

export function simulateArchitecture(blueprint: Blueprint, input: BlueprintInput): SimulationResult {
    const userFlow: string[] = [];
    const systemFlow: string[] = [];
    const dataFlow: string[] = [];
    const observations: string[] = [];

    const safeBlueprint = blueprint || { features: [], techStack: [], databaseTables: [], apiRoutes: [], roadmap: [] };
    const { features, techStack, databaseTables, apiRoutes } = safeBlueprint;
    const { platform = "Web App", businessModel = "", coreFeature = "core features" } = input;

    const lowerPlatform = platform.toLowerCase();
    const lowerBusinessModel = businessModel.toLowerCase();
    const isMobile = lowerPlatform.includes("mobile") || lowerPlatform.includes("ios") || lowerPlatform.includes("android");
    const isSaaS = lowerBusinessModel.includes("saas") || lowerBusinessModel.includes("subscription");
    const hasAuth = databaseTables.some(t => t.toLowerCase().includes("user") || t.toLowerCase().includes("account")) || features.some(f => f.toLowerCase().includes("auth") || f.toLowerCase().includes("login"));
    const hasPayment = features.some(f => f.toLowerCase().includes("pay") || f.toLowerCase().includes("stripe") || f.toLowerCase().includes("billing"));
    const hasRealtime = techStack.some(t => t.toLowerCase().includes("socket") || t.toLowerCase().includes("pusher") || t.toLowerCase().includes("realtime")) || features.some(f => f.toLowerCase().includes("real-time") || f.toLowerCase().includes("realtime") || f.toLowerCase().includes("live"));

    // --- 1. User Flow Simulation ---
    userFlow.push(`User opens ${isMobile ? 'the mobile app' : 'the application'} on their device`);
    if (hasAuth || isSaaS) {
        userFlow.push(`User signs up or authenticates into their account securely`);
    }
    userFlow.push(`User navigates to engage with: ${coreFeature}`);
    if (features.some(f => f.toLowerCase().includes("dashboard"))) {
        userFlow.push(`User views their personalized dashboard and active metrics`);
    } else {
        userFlow.push(`User submits input or interacts with the primary interface`);
    }
    if (hasPayment) {
        userFlow.push(`User upgrades to a premium tier or completes a checkout flow`);
    }
    userFlow.push(`User receives expected generated results or system feedback instantly`);


    // --- 2. System Flow Simulation ---
    systemFlow.push(`Frontend client formulates and sends a request payload to the API layer`);
    if (apiRoutes.length > 0) {
        const sampleRoute = apiRoutes.find(r => r.includes("POST")) || apiRoutes[0];
        systemFlow.push(`API boundary (${sampleRoute.split(' ')[0] || 'Endpoint'}) intercepts, validates, and authenticates the incoming request`);
    } else {
        systemFlow.push(`Backend service intercepts, validates, and authenticates the incoming request`);
    }
    systemFlow.push(`Service layer executes primary business logic and state mutations`);
    if (techStack.some(t => t.toLowerCase().includes("openai") || t.toLowerCase().includes("ai") || t.toLowerCase().includes("llm"))) {
        systemFlow.push(`System integrates with external AI/LLM providers for specialized processing`);
    }
    if (databaseTables.length > 0) {
        systemFlow.push(`Database adapter reads/writes necessary domain entities to persistent storage`);
    }
    systemFlow.push(`Server constructs a serialized response and returns data back over the wire`);
    systemFlow.push(`Frontend seamlessly reconciles the new state and updates the UI`);

    // --- 3. Data Flow Simulation ---
    if (hasAuth) {
        dataFlow.push(`Client session tokens are securely minted and stored (e.g. HttpOnly cookies or secure storage)`);
        dataFlow.push(`User profiles and identity records are persisted in the 'users' related tables`);
    } else {
        dataFlow.push(`Anonymous visitor sessions or minimal tracking may be stored locally`);
    }

    const domainTables = databaseTables.filter(t => !t.toLowerCase().includes("user") && !t.toLowerCase().includes("account") && !t.toLowerCase().includes("session"));
    if (domainTables.length > 0) {
        dataFlow.push(`Core application entities (${domainTables.slice(0, 2).join(", ")}) are saved and related appropriately`);
    } else {
        dataFlow.push(`Application data is pushed to the primary data store`);
    }

    if (techStack.some(t => t.toLowerCase().includes("redis") || t.toLowerCase().includes("memcached") || t.toLowerCase().includes("cache"))) {
        dataFlow.push(`Hot data and shared states are pushed to memory cache for rapid retrieval`);
    }
    if (features.some(f => f.toLowerCase().includes("file") || f.toLowerCase().includes("upload") || f.toLowerCase().includes("image"))) {
        dataFlow.push(`Binary assets/files are uploaded to a blob storage bucket (e.g. S3) while metadata is saved to DB`);
    }

    // --- 4. Observations / Architecture Notes ---
    if (apiRoutes.length > 15) {
        observations.push(`Considerable API surface area inferred; strict OpenAPI/Swagger documentation or GraphQL might simplify client integration.`);
    }
    if (isSaaS && !hasAuth) {
        observations.push(`Warning: Product is labelled as SaaS but explicitly lacks user/auth database tables. Ensure multi-tenancy is accounted for.`);
    }
    if (databaseTables.length > 7) {
        observations.push(`Moderately complex data schema; ensure proper indexing on foreign keys early to avoid performance bottlenecks as tables grow.`);
    }
    if (hasRealtime) {
        observations.push(`Realtime features are present. Ensure the hosting environment supports persistent WebSocket connections or long-polling gracefully.`);
    }
    if (features.length > 8 && !features.some(f => f.toLowerCase().includes("test"))) {
        observations.push(`High feature count without explicit focus on testing or CI/CD. Consider adding an automated testing layer to ensure stability.`);
    }
    if (techStack.some(t => t.toLowerCase().includes("next.js") || t.toLowerCase().includes("react") || t.toLowerCase().includes("typescript"))) {
        observations.push(`Unified fullstack TypeScript usage (e.g. Next.js/React/Node) offers strong developer velocity through shared types between client and server.`);
    }
    if (observations.length < 3) {
        observations.push(`Architecture appears straightforward for a lean MVP path. Keep infrastructure minimal until user traction forces scaling.`);
        observations.push(`Monitor database read/write ratios closely as the core feature gains usage to determine future caching needs.`);
    }

    return { userFlow, systemFlow, dataFlow, observations };
}
