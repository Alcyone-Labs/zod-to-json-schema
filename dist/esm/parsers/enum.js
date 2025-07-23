export function parseEnumDef(def) {
    // In Zod V4, use entries instead of values
    const values = def.entries ? Object.values(def.entries) : def.values;
    return {
        type: "string",
        enum: Array.from(values),
    };
}
