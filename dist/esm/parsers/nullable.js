import { getInnerTypeDef, getDefTypeName, getAllPrimitiveTypeNames, primitiveMappings, } from "../zodV3V4Compat.js";
import { parseDef } from "../parseDef.js";
export function parseNullableDef(def, refs) {
    const innerTypeDef = getInnerTypeDef(def);
    const innerTypeKey = getDefTypeName(innerTypeDef);
    if (innerTypeKey &&
        getAllPrimitiveTypeNames().includes(innerTypeKey) &&
        (!innerTypeDef.checks || !innerTypeDef.checks.length)) {
        if (refs.target === "openApi3") {
            return {
                type: primitiveMappings[innerTypeKey],
                nullable: true,
            };
        }
        return {
            type: [
                primitiveMappings[innerTypeKey],
                "null",
            ],
        };
    }
    if (refs.target === "openApi3") {
        const base = parseDef(innerTypeDef, {
            ...refs,
            currentPath: [...refs.currentPath],
        });
        if (base && "$ref" in base) {
            const result = { allOf: [base], nullable: true };
            // Try to get description from the referenced definition
            const refPath = base.$ref;
            if (refPath && refPath.includes(refs.definitionPath)) {
                const pathParts = refPath.split("/");
                const defName = pathParts[pathParts.length - 1];
                const definitionSchema = refs.definitions[defName];
                if (definitionSchema) {
                    let description;
                    // Try to get description via meta() method
                    if (typeof definitionSchema.meta === "function") {
                        try {
                            const meta = definitionSchema.meta();
                            if (meta && meta.description) {
                                description = meta.description;
                            }
                        }
                        catch (e) {
                            // Ignore errors
                        }
                    }
                    // Fallback to direct description property
                    if (!description && definitionSchema.description) {
                        description = definitionSchema.description;
                    }
                    if (description) {
                        result.description = description;
                    }
                }
            }
            return result;
        }
        return base && { ...base, nullable: true };
    }
    const base = parseDef(innerTypeDef, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", "0"],
    });
    return base && { anyOf: [base, { type: "null" }] };
}
