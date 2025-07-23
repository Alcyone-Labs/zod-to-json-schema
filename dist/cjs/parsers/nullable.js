"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNullableDef = parseNullableDef;
const zodV3V4Compat_js_1 = require("../zodV3V4Compat.js");
const parseDef_js_1 = require("../parseDef.js");
function parseNullableDef(def, refs) {
    const innerTypeDef = (0, zodV3V4Compat_js_1.getInnerTypeDef)(def);
    const innerTypeKey = (0, zodV3V4Compat_js_1.getDefTypeName)(innerTypeDef);
    if (innerTypeKey &&
        (0, zodV3V4Compat_js_1.getAllPrimitiveTypeNames)().includes(innerTypeKey) &&
        (!innerTypeDef.checks || !innerTypeDef.checks.length)) {
        if (refs.target === "openApi3") {
            return {
                type: zodV3V4Compat_js_1.primitiveMappings[innerTypeKey],
                nullable: true,
            };
        }
        return {
            type: [
                zodV3V4Compat_js_1.primitiveMappings[innerTypeKey],
                "null",
            ],
        };
    }
    if (refs.target === "openApi3") {
        const base = (0, parseDef_js_1.parseDef)(innerTypeDef, {
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
    const base = (0, parseDef_js_1.parseDef)(innerTypeDef, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", "0"],
    });
    return base && { anyOf: [base, { type: "null" }] };
}
