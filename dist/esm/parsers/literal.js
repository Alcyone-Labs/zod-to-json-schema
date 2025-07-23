export function parseLiteralDef(def, // Changed from ZodLiteralDef to any for Zod V4 compatibility
refs) {
    // In Zod V4, use values[0] instead of value
    const value = def.values ? def.values[0] : def.value;
    const parsedType = typeof value;
    if (parsedType !== "bigint" &&
        parsedType !== "number" &&
        parsedType !== "boolean" &&
        parsedType !== "string") {
        return {
            type: Array.isArray(value) ? "array" : "object",
        };
    }
    if (refs.target === "openApi3") {
        return {
            type: parsedType === "bigint" ? "integer" : parsedType,
            enum: [value],
        };
    }
    return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        const: value,
    };
}
