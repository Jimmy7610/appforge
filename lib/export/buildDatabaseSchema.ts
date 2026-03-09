interface BuildDatabaseSchemaInput {
    databaseTables: string[];
}

function sanitizeKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

function fieldsForTable(key: string): Record<string, string> {
    const fields: Record<string, string> = { id: "string" };

    if (/user|profile|member|account/.test(key)) {
        fields.email = "string";
        fields.name = "string";
    }

    if (/project|app/.test(key)) {
        fields.title = "string";
        fields.description = "string";
    }

    if (/activity|log|audit/.test(key)) {
        fields.action = "string";
    }

    if (/notification|alert/.test(key)) {
        fields.message = "string";
        fields.read = "boolean";
    }

    fields.createdAt = "string";
    return fields;
}

export function buildDatabaseSchema({ databaseTables }: BuildDatabaseSchemaInput): Record<string, string> {
    if (!databaseTables.length) return {};

    const entries = databaseTables
        .map(sanitizeKey)
        .filter(Boolean)
        .map((key) => {
            const fields = fieldsForTable(key);
            const fieldLines = Object.entries(fields)
                .map(([k, v]) => `    ${k}: "${v}"`)
                .join(",\n");
            return `  ${key}: {\n${fieldLines},\n  }`;
        });

    const content = `// Auto-generated database schema scaffold\n// Derived from blueprint database tables\n\nexport const schema = {\n${entries.join(",\n")},\n} as const;\n\nexport type SchemaTable = keyof typeof schema;\n`;

    return { "lib/db/schema.ts": content };
}
