export interface RefinePreset {
    id: string;
    title: string;
    description: string;
    instruction: string;
    iconType?: "security" | "scalability" | "performance" | "production" | "realtime" | "saas" | "mvp" | "dx" | "cost";
    details: {
        purpose: string;
        bullets: string[];
    };
}

export const REFINE_PRESETS: RefinePreset[] = [
    {
        id: "security-pass",
        title: "Security Pass",
        description: "Harden auth, inputs, and boundaries.",
        instruction: "Add robust JWT or session-based authentication, enforce strict RBAC authorization across all endpoints, add input validation (e.g. using Zod), and implement API rate limiting and secure secrets handling.",
        iconType: "security",
        details: {
            purpose: "Harden the architecture against unauthorized access and data breaches.",
            bullets: [
                "Identify missing authentication layers",
                "Enforce strict RBAC authorization",
                "Add input validation & rate limiting",
                "Secure application secret management"
            ]
        }
    },
    {
        id: "scalability-pass",
        title: "Scalability Pass",
        description: "Prepare for horizontal scaling.",
        instruction: "Optimize the architecture for horizontal scaling. Add load balancing, decouple synchronous services, introduce async background processing for heavy tasks, and centralize state management with Redis.",
        iconType: "scalability",
        details: {
            purpose: "Restructure the system to handle increased load and traffic gracefully.",
            bullets: [
                "Decouple synchronous bottlenecks",
                "Integrate load balancing",
                "Add async background processing",
                "Centralize state and caching"
            ]
        }
    },
    {
        id: "performance-pass",
        title: "Performance Pass",
        description: "Reduce latency and optimize queries.",
        instruction: "Optimize critical paths to reduce latency. Add memory caching for hot read paths, optimize database schemas with proper indexing, and resolve potential N+1 query bottlenecks in the data layer.",
        iconType: "performance",
        details: {
            purpose: "Optimize the architecture for speed and rapid responsiveness.",
            bullets: [
                "Reduce latency on critical paths",
                "Eliminate N+1 database queries",
                "Add caching for frequent reads",
                "Optimize payload sizes"
            ]
        }
    },
    {
        id: "production-pass",
        title: "Production Pass",
        description: "Add monitoring and error handling.",
        instruction: "Make the architecture production-ready. Ensure all components have structured logging, implement global error boundaries, add system health checks, and integrate an APM/Observability stack.",
        iconType: "production",
        details: {
            purpose: "Make the architecture sturdy, observable, and ready for real users.",
            bullets: [
                "Add structured logging & APM",
                "Implement health checks",
                "Set up global error boundaries",
                "Ensure automated backups"
            ]
        }
    },
    {
        id: "realtime-pass",
        title: "Realtime Pass",
        description: "Strengthen websocket & state sync.",
        instruction: "Design a resilient real-time architecture. Add highly available WebSocket servers, implement resilient pub/sub message brokers (e.g. Redis Stream or Kafka), and handle client disconnect/reconnect state gracefully.",
        iconType: "realtime",
        details: {
            purpose: "Strengthen live data synchronization and concurrent user state.",
            bullets: [
                "Add resilient WebSocket servers",
                "Integrate pub/sub message brokers",
                "Handle client disconnects cleanly",
                "Optimize real-time state sync"
            ]
        }
    },
    {
        id: "saas-pass",
        title: "SaaS Pass",
        description: "Add billing, tenants, and admin.",
        instruction: "Restructure for a B2B SaaS model. Add strict multi-tenant data isolation, integrate subscription billing with robust webhook handlers, and add an admin reporting infrastructure.",
        iconType: "saas",
        details: {
            purpose: "Adapt the system for a multi-tenant B2B commercial model.",
            bullets: [
                "Enforce strict tenant data isolation",
                "Integrate subscription billing",
                "Implement webhook handlers",
                "Build admin back-office infrastructure"
            ]
        }
    },
    {
        id: "mvp-pass",
        title: "MVP Pass",
        description: "Simplify to core launchable value.",
        instruction: "Simplify the current architecture into the smallest realistic launchable version (MVP). Reduce unnecessary complexity, prioritize core user value, remove premature enterprise patterns, and make the roadmap leaner and more launch-focused.",
        iconType: "mvp",
        details: {
            purpose: "Strip away enterprise bloat to focus on a lean, launchable product.",
            bullets: [
                "Remove premature overengineering",
                "Prioritize core user value",
                "Simplify necessary infrastructure",
                "Focus on speed-to-market"
            ]
        }
    },
    {
        id: "dx-pass",
        title: "DX Pass",
        description: "Improve maintainability & dev flow.",
        instruction: "Improve developer experience (DX) and maintainability. Improve folder/module boundaries, enforce naming consistency, reduce fragile abstractions, recommend maintainable developer workflows (e.g., CI/CD basics, linting), and improve testability and clarity.",
        iconType: "dx",
        details: {
            purpose: "Improve developer experience and long-term codebase health.",
            bullets: [
                "Enforce clear folder and module boundaries",
                "Reduce fragile abstractions",
                "Introduce maintaining workflows (CI/CD)",
                "Improve testability and readability"
            ]
        }
    },
    {
        id: "cost-optimization-pass",
        title: "Cost Optimization Pass",
        description: "Reduce infra & operational limits.",
        instruction: "Reduce likely infrastructure and operational cost overhead. Prefer simpler services where reasonable, reduce overengineering, avoid costly realtime/distributed patterns unless clearly needed, and favor cost-aware hosting, data, and API choices (e.g., serverless over always-on where traffic is unknown).",
        iconType: "cost",
        details: {
            purpose: "Reduce infrastructure footprint and operational overhead.",
            bullets: [
                "Prefer simpler, cheaper services",
                "Remove unnecessary distributed systems",
                "Favor serverless over always-on",
                "Optimize data storage costs"
            ]
        }
    }
];
