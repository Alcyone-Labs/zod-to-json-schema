import { parseDef, setSchemaMetaInfo } from "./parseDef.js";
import { getRefs } from "./Refs.js";
import { parseAnyDef } from "./parsers/any.js";
import { extractMetadata } from "./zodV3V4Compat.js";
// Function to extract and store meta information from a schema
const extractAndStoreMetaInfo = (schema) => {
    if (!schema || !schema._def)
        return;
    // Extract meta information using the compatibility layer
    const metaInfo = extractMetadata(schema);
    // Store the meta information if we found any
    if (Object.keys(metaInfo).length > 0) {
        setSchemaMetaInfo(schema._def, metaInfo);
    }
    // Recursively process nested schemas
    if (schema._def.innerType) {
        extractAndStoreMetaInfo(schema._def.innerType);
    }
    if (schema._def.options && Array.isArray(schema._def.options)) {
        schema._def.options.forEach((option) => extractAndStoreMetaInfo(option));
    }
    if (schema._def.left) {
        extractAndStoreMetaInfo(schema._def.left);
    }
    if (schema._def.right) {
        extractAndStoreMetaInfo(schema._def.right);
    }
    if (schema._def.schema) {
        extractAndStoreMetaInfo(schema._def.schema);
    }
    if (schema._def.type) {
        extractAndStoreMetaInfo(schema._def.type);
    }
    // Handle object properties
    if (schema._def.shape && typeof schema._def.shape === "object") {
        Object.values(schema._def.shape).forEach((propSchema) => {
            extractAndStoreMetaInfo(propSchema);
        });
    }
    // Handle array elements
    if (schema._def.element) {
        extractAndStoreMetaInfo(schema._def.element);
    }
    // Handle object shapes (properties)
    if (schema._def.shape && typeof schema._def.shape === "object") {
        Object.values(schema._def.shape).forEach((propertySchema) => {
            extractAndStoreMetaInfo(propertySchema);
        });
    }
    // Handle array items
    if (schema._def.type && schema._def.type._def) {
        extractAndStoreMetaInfo(schema._def.type);
    }
};
const zodToJsonSchema = (schema, options) => {
    const refs = getRefs(options);
    // Extract and store meta information from the main schema and any definitions
    extractAndStoreMetaInfo(schema);
    if (typeof options === "object" && options.definitions) {
        Object.values(options.definitions).forEach((defSchema) => {
            extractAndStoreMetaInfo(defSchema);
        });
    }
    let definitions = typeof options === "object" && options.definitions
        ? Object.entries(options.definitions).reduce((acc, [name, schema]) => ({
            ...acc,
            [name]: parseDef(schema._def, {
                ...refs,
                currentPath: [...refs.basePath, refs.definitionPath, name],
            }, true) ?? parseAnyDef(refs),
        }), {})
        : undefined;
    const name = typeof options === "string"
        ? options
        : options?.nameStrategy === "title"
            ? undefined
            : options?.name;
    const main = parseDef(schema._def, name === undefined
        ? refs
        : {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name],
        }, false) ?? parseAnyDef(refs);
    const title = typeof options === "object" &&
        options.name !== undefined &&
        options.nameStrategy === "title"
        ? options.name
        : undefined;
    if (title !== undefined) {
        main.title = title;
    }
    if (refs.flags.hasReferencedOpenAiAnyType) {
        if (!definitions) {
            definitions = {};
        }
        if (!definitions[refs.openAiAnyTypeName]) {
            definitions[refs.openAiAnyTypeName] = {
                // Skipping "object" as no properties can be defined and additionalProperties must be "false"
                type: ["string", "number", "integer", "boolean", "array", "null"],
                items: {
                    $ref: refs.$refStrategy === "relative"
                        ? "1"
                        : [
                            ...refs.basePath,
                            refs.definitionPath,
                            refs.openAiAnyTypeName,
                        ].join("/"),
                },
            };
        }
    }
    const combined = name === undefined
        ? definitions
            ? {
                ...main,
                [refs.definitionPath]: definitions,
            }
            : main
        : {
            $ref: [
                ...(refs.$refStrategy === "relative" ? [] : refs.basePath),
                refs.definitionPath,
                name,
            ].join("/"),
            [refs.definitionPath]: {
                ...definitions,
                [name]: main,
            },
        };
    if (refs.target === "jsonSchema7") {
        combined.$schema = "http://json-schema.org/draft-07/schema#";
    }
    else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
        combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
    }
    if (refs.target === "openAi" &&
        ("anyOf" in combined ||
            "oneOf" in combined ||
            "allOf" in combined ||
            ("type" in combined && Array.isArray(combined.type)))) {
        console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
    }
    return combined;
};
export { zodToJsonSchema };
