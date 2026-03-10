import { AITaskHandler } from "./types";
import { BlueprintCritique, CritiqueItem } from "../types";

function extractJson(text: string | null | undefined): string {
    if (!text) return "{}";
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        return text.slice(start, end + 1);
    }
    return text;
}

export const critiqueBlueprintTask: AITaskHandler<"critiqueBlueprint"> = {
    id: "critiqueBlueprint",

    buildPrompt(input) {
        return `You are a senior software architect and system reviewer. 
Review the following application architecture blueprint and provide a structured, critical assessment of its quality, risks, and improvement opportunities.

App Idea: ${input.originalInput.idea || "A general application"}
Platform: ${input.originalInput.platform || "Web"}
Business Model: ${input.originalInput.businessModel || "SaaS"}
Target Users: ${input.originalInput.targetUsers || "General users"}
Core Feature: ${input.originalInput.coreFeature || "Core functionality"}

CURRENT BLUEPRINT CONTENT:
${JSON.stringify(input.currentBlueprint, null, 2)}

Provide a structured critique covering:
1. Overall Assessment: A high-level view of the architecture's viability and alignment.
2. Risks: Potential technical or business risks (e.g., complexity, security, scalability).
3. Bottlenecks: Areas that could cause performance issues or development friction.
4. Security Concerns: Missing or weak security measures.
5. Missing Considerations: Important architectural or infrastructure pieces not present in the current blueprint.
6. Recommendations: Concrete, actionable steps to improve the blueprint.
7. Architecture Scores: Numerical scores (0-100) for Security, Performance, Scalability, and Maintainability, plus an overall score.
8. Priority/Severity: An overall level (low/medium/high).
9. Summary: A very concise executive summary.

Return a pure JSON object matching this exact interface:
{
    "overallAssessment": "String",
    "scores": {
        "overall": 0-100,
        "security": 0-100,
        "performance": 0-100,
        "scalability": 0-100,
        "maintainability": 0-100
    },
    "risks": [{ "title": "String", "detail": "String", "severity": "low|medium|high", "recommendation": "String" }],
    "bottlenecks": [{ "title": "String", "detail": "String", "severity": "low|medium|high", "recommendation": "String" }],
    "securityConcerns": [{ "title": "String", "detail": "String", "severity": "low|medium|high", "recommendation": "String" }],
    "missingConsiderations": [{ "title": "String", "detail": "String", "severity": "low|medium|high", "recommendation": "String" }],
    "recommendations": [{ "title": "String", "detail": "String", "severity": "low|medium|high", "recommendation": "String" }],
    "priorityLevel": "low|medium|high",
    "summary": "String"
}

IMPORTANT:
- Be critical but constructive.
- Prefer practical, actionable insights over generic theory.
- Focus on the specific context of the app idea and platform.
- Do not include any text outside the JSON object.`;
    },

    parseResponse(rawContent: string): BlueprintCritique {
        const cleanJson = extractJson(rawContent);
        const parsed = JSON.parse(cleanJson);

        // Basic validation and normalization
        const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];

        return {
            overallAssessment: parsed.overallAssessment || "Assessment unavailable",
            scores: parsed.scores || {
                overall: 70,
                security: 70,
                performance: 70,
                scalability: 70,
                maintainability: 70
            },
            risks: ensureArray(parsed.risks),
            bottlenecks: ensureArray(parsed.bottlenecks),
            securityConcerns: ensureArray(parsed.securityConcerns),
            missingConsiderations: ensureArray(parsed.missingConsiderations),
            recommendations: ensureArray(parsed.recommendations),
            priorityLevel: (parsed.priorityLevel === "high" || parsed.priorityLevel === "medium" || parsed.priorityLevel === "low") ? parsed.priorityLevel : "medium",
            summary: parsed.summary || "Summary unavailable"
        };
    },

    getFallback(input, settings, providerId, error): BlueprintCritique {
        console.warn(`[${providerId}] Task fallback invoked for critiqueBlueprint:`, error);

        const bp = input.currentBlueprint;
        const risks: CritiqueItem[] = [];
        const bottlenecks: CritiqueItem[] = [];
        const securityConcerns: CritiqueItem[] = [];
        const missingConsiderations: CritiqueItem[] = [];
        const recommendations: CritiqueItem[] = [];

        // Basic heuristics for fallback critique
        const features = bp.features || [];
        const tables = bp.databaseTables || [];
        const hasAuth = tables.some(t => t.toLowerCase().includes('user') || t.toLowerCase().includes('account') || t.toLowerCase().includes('auth'));
        const hasPayment = features.some(f => f.toLowerCase().includes('pay') || f.toLowerCase().includes('stripe') || f.toLowerCase().includes('subscrip'));

        if (!hasAuth && (features.length > 5 || hasPayment)) {
            securityConcerns.push({
                title: "Missing Authentication Layer",
                detail: "The blueprint defines significant features and data but lacks explicit user authentication tables or routes.",
                severity: "high",
                recommendation: "Introduce a dedicated Auth provider (e.g., NextAuth, Clerk) and User tables."
            });
        }

        if (tables.length > 0 && !tables.some(t => t.toLowerCase().includes('audit') || t.toLowerCase().includes('log') || t.toLowerCase().includes('histor'))) {
            missingConsiderations.push({
                title: "Lack of Audit Logging",
                detail: "Critical data modifications are not tracked, making debugging and security auditing difficult.",
                severity: "medium",
                recommendation: "Add an 'audit_logs' or 'activity_logs' table to track sensitive changes."
            });
        }

        if (input.originalInput.platform === "mobile" && !features.some(f => f.toLowerCase().includes('offline') || f.toLowerCase().includes('cache'))) {
            bottlenecks.push({
                title: "Network Dependency",
                detail: "Mobile applications often face connectivity issues. No offline-first strategy is defined.",
                severity: "medium",
                recommendation: "Implement a local caching layer (e.g., React Query, IndexedDB) for core data."
            });
        }

        if (hasPayment) {
            risks.push({
                title: "Payment Integration Complexity",
                detail: "Handling subscriptions and transactions requires robust error handling and webhook management.",
                severity: "medium",
                recommendation: "Ensure a dedicated service layer is planned for Stripe/external API interactions."
            });
        }

        // Generic recommendations if lists are sparse
        if (recommendations.length === 0) {
            recommendations.push({
                title: "Expand Documentation",
                detail: "The current blueprint is a good start but needs more detail on component-level interactions.",
                severity: "low",
                recommendation: "Use 'Explain Architecture' to generate deeper insights and refine the roadmap."
            });
        }

        // Base Heuristic Scores
        const scores = {
            overall: 75,
            security: 80,
            performance: 75,
            scalability: 70,
            maintainability: 80
        };

        if (securityConcerns.length > 0) {
            scores.security -= 20;
            scores.overall -= 5;
        }
        if (bottlenecks.length > 0) {
            scores.performance -= 15;
            scores.overall -= 5;
        }
        if (risks.some(r => r.severity === "high")) {
            scores.scalability -= 20;
            scores.overall -= 10;
        }

        return {
            overallAssessment: "This is a deterministically generated fallback critique based on common architectural patterns. While the initial structure is sound, several standard production concerns remain unaddressed.",
            scores,
            risks,
            bottlenecks,
            securityConcerns,
            missingConsiderations,
            recommendations,
            priorityLevel: risks.some(r => r.severity === "high") ? "high" : "medium",
            summary: "Initial scaffold is viable but requires more focus on operational and security foundations.",
            metadata: {
                provider: providerId,
                model: settings.model || "unknown",
                usedFallback: true,
                sourceLabel: `${providerId === "openai" ? "OpenAI" : "Ollama"} (${settings.model || "unknown"}) — local critique generator`
            }
        };
    }
};
