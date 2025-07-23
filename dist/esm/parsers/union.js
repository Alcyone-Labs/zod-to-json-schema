import { parseDef, getSchemaMetaInfo, setSchemaMetaInfo } from "../parseDef.js";
import { getDefTypeName } from "../zodV3V4Compat.js";
const primitiveMappings = {
    // Zod V3 type names
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "integer",
    ZodBoolean: "boolean",
    ZodNull: "null",
    // Zod V4 type names
    string: "string",
    number: "number",
    bigint: "integer",
    boolean: "boolean",
    null: "null",
};
// Function to extract meta information from a schema (similar to zodToJsonSchema.ts)
const extractMetaInfoForSchema = (schema) => {
    if (!schema || !schema._def)
        return;
    let metaInfo = {};
    // Check for description property (from .describe())
    if (schema.description) {
        metaInfo.description = schema.description;
    }
    // Check for meta function (from .meta())
    if (typeof schema.meta === "function") {
        try {
            const meta = schema.meta();
            if (meta && typeof meta === "object") {
                metaInfo = { ...metaInfo, ...meta };
            }
        }
        catch (e) {
            // Ignore errors when calling meta()
        }
    }
    // Store the meta information if we found any
    if (Object.keys(metaInfo).length > 0) {
        setSchemaMetaInfo(schema._def, metaInfo);
    }
};
export function parseUnionDef(def, refs) {
    if (refs.target === "openApi3")
        return asAnyOf(def, refs);
    const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
    // Extract meta information for each option to ensure descriptions are available
    options.forEach((option) => extractMetaInfoForSchema(option));
    // This blocks tries to look ahead a bit to produce nicer looking schemas with type array instead of anyOf.
    if (options.every((x) => {
        const typeKey = getDefTypeName(x._def);
        return (typeKey &&
            typeKey in primitiveMappings &&
            (!x._def.checks || !x._def.checks.length));
    })) {
        // all types in union are primitive and lack checks, so might as well squash into {type: [...]}
        const types = options.reduce((types, x) => {
            const typeKey = getDefTypeName(x._def);
            const type = typeKey
                ? primitiveMappings[typeKey]
                : undefined;
            return type && !types.includes(type) ? [...types, type] : types;
        }, []);
        return {
            type: types.length > 1 ? types : types[0],
        };
    }
    else if (options.every((x) => {
        const typeKey = getDefTypeName(x._def);
        const hasDescription = x.description || getSchemaMetaInfo(x._def)?.description;
        return (typeKey &&
            (typeKey === "ZodLiteral" || typeKey === "literal") &&
            !hasDescription);
    })) {
        // all options literals
        const types = options.reduce((acc, x) => {
            // In Zod V4, use values[0] instead of value
            const value = x._def.values
                ? x._def.values[0]
                : x._def.value;
            const type = typeof value;
            switch (type) {
                case "string":
                case "number":
                case "boolean":
                    return [...acc, type];
                case "bigint":
                    return [...acc, "integer"];
                case "object":
                    if (value === null)
                        return [...acc, "null"];
                case "symbol":
                case "undefined":
                case "function":
                default:
                    return acc;
            }
        }, []);
        if (types.length === options.length) {
            // all the literals are primitive, as far as null can be considered primitive
            const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
            return {
                type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
                enum: options.reduce((acc, x) => {
                    // In Zod V4, use values[0] instead of value
                    const value = x._def.values
                        ? x._def.values[0]
                        : x._def.value;
                    return acc.includes(value) ? acc : [...acc, value];
                }, []),
            };
        }
    }
    else if (options.every((x) => {
        const typeKey = getDefTypeName(x._def);
        return typeKey === "ZodEnum" || typeKey === "enum";
    })) {
        return {
            type: "string",
            enum: options.reduce((acc, x) => {
                // In Zod V4, use entries instead of values
                const values = x._def.entries
                    ? Object.values(x._def.entries)
                    : x._def.values;
                return [...acc, ...values.filter((x) => !acc.includes(x))];
            }, []),
        };
    }
    return asAnyOf(def, refs);
}
const asAnyOf = (def, refs) => {
    const anyOf = (def.options instanceof Map
        ? Array.from(def.options.values())
        : def.options)
        .map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", `${i}`],
    }))
        .filter((x) => !!x &&
        (!refs.strictUnions ||
            (typeof x === "object" && Object.keys(x).length > 0)));
    return anyOf.length ? { anyOf } : undefined;
};
