export interface DetectedFeatures {
    hasProfile: boolean;
    hasActivity: boolean;
    hasTeam: boolean;
}

export function detectFeatures(features: string[], databaseTables: string[]): DetectedFeatures {
    const allText = [...features, ...databaseTables].map(s => s.toLowerCase()).join(" ");

    return {
        hasProfile: /auth|profile|user.?setting|account|login|signup|sign.?up/.test(allText),
        hasActivity: /activity|log|notification|event|feed|timeline/.test(allText),
        hasTeam: /team|collaborat|member|group|organization|workspace/.test(allText),
    };
}
