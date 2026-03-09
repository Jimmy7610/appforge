export interface RefinePreset {
    id: string;
    title: string;
    description: string;
    instruction: string;
    iconType?: "security" | "scalability" | "performance" | "production" | "realtime" | "saas";
}

export const REFINE_PRESETS: RefinePreset[] = [
    {
        id: "security-pass",
        title: "Security Pass",
        description: "Harden auth, inputs, and boundaries.",
        instruction: "Add robust JWT or session-based authentication, enforce strict RBAC authorization across all endpoints, add input validation (e.g. using Zod), and implement API rate limiting and secure secrets handling.",
        iconType: "security"
    },
    {
        id: "scalability-pass",
        title: "Scalability Pass",
        description: "Prepare for horizontal scaling.",
        instruction: "Optimize the architecture for horizontal scaling. Add load balancing, decouple synchronous services, introduce async background processing for heavy tasks, and centralize state management with Redis.",
        iconType: "scalability"
    },
    {
        id: "performance-pass",
        title: "Performance Pass",
        description: "Reduce latency and optimize queries.",
        instruction: "Optimize critical paths to reduce latency. Add memory caching for hot read paths, optimize database schemas with proper indexing, and resolve potential N+1 query bottlenecks in the data layer.",
        iconType: "performance"
    },
    {
        id: "production-pass",
        title: "Production Pass",
        description: "Add monitoring and error handling.",
        instruction: "Make the architecture production-ready. Ensure all components have structured logging, implement global error boundaries, add system health checks, and integrate an APM/Observability stack.",
        iconType: "production"
    },
    {
        id: "realtime-pass",
        title: "Realtime Pass",
        description: "Strengthen websocket & state sync.",
        instruction: "Design a resilient real-time architecture. Add highly available WebSocket servers, implement resilient pub/sub message brokers (e.g. Redis Stream or Kafka), and handle client disconnect/reconnect state gracefully.",
        iconType: "realtime"
    },
    {
        id: "saas-pass",
        title: "SaaS Pass",
        description: "Add billing, tenants, and admin.",
        instruction: "Restructure for a B2B SaaS model. Add strict multi-tenant data isolation, integrate subscription billing with robust webhook handlers, and add an admin reporting infrastructure.",
        iconType: "saas"
    }
];
