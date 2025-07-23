"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRecordDef = parseRecordDef;
const parseDef_js_1 = require("../parseDef.js");
const string_js_1 = require("./string.js");
const branded_js_1 = require("./branded.js");
const any_js_1 = require("./any.js");
function parseRecordDef(def, refs) {
    if (refs.target === "openAi") {
        console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
    }
    // In Zod V4, check for enum type differently
    const keyTypeDef = def.keyType?.def || def.keyType?._def;
    const keyTypeType = keyTypeDef?.type || keyTypeDef?.typeName;
    if (refs.target === "openApi3" &&
        (keyTypeType === "enum" || keyTypeType === "ZodEnum")) {
        // In Zod V4, get values from entries or values
        const enumValues = keyTypeDef?.entries ? Object.values(keyTypeDef.entries) : keyTypeDef?.values;
        const valueTypeDef = def.valueType?.def || def.valueType?._def;
        if (enumValues && Array.isArray(enumValues)) {
            return {
                type: "object",
                required: enumValues,
                properties: enumValues.reduce((acc, key) => ({
                    ...acc,
                    [key]: (0, parseDef_js_1.parseDef)(valueTypeDef, {
                        ...refs,
                        currentPath: [...refs.currentPath, "properties", key],
                    }) ?? (0, any_js_1.parseAnyDef)(refs),
                }), {}),
                additionalProperties: refs.rejectedAdditionalProperties,
            };
        }
    }
    // In Zod V4, if there's no valueType, the keyType is actually the value type
    const actualValueType = def.valueType || def.keyType;
    const valueTypeDef = actualValueType?.def || actualValueType?._def;
    const schema = {
        type: "object",
        additionalProperties: valueTypeDef ? (0, parseDef_js_1.parseDef)(valueTypeDef, {
            ...refs,
            currentPath: [...refs.currentPath, "additionalProperties"],
        }) : refs.allowedAdditionalProperties,
    };
    if (refs.target === "openApi3") {
        return schema;
    }
    if ((keyTypeType === "string" || keyTypeType === "ZodString") &&
        keyTypeDef?.checks?.length) {
        const { type, ...keyType } = (0, string_js_1.parseStringDef)(keyTypeDef, refs);
        return {
            ...schema,
            propertyNames: keyType,
        };
    }
    else if (keyTypeType === "enum" || keyTypeType === "ZodEnum") {
        const enumValues = keyTypeDef?.entries ? Object.values(keyTypeDef.entries) : keyTypeDef?.values;
        return {
            ...schema,
            propertyNames: {
                enum: enumValues,
            },
        };
    }
    else if ((keyTypeType === "branded" || keyTypeType === "ZodBranded") &&
        keyTypeDef?.type) {
        const brandedTypeDef = keyTypeDef.type?.def || keyTypeDef.type?._def;
        const brandedTypeType = brandedTypeDef?.type || brandedTypeDef?.typeName;
        if ((brandedTypeType === "string" || brandedTypeType === "ZodString") &&
            brandedTypeDef?.checks?.length) {
            const { type, ...keyType } = (0, branded_js_1.parseBrandedDef)(keyTypeDef, refs);
            return {
                ...schema,
                propertyNames: keyType,
            };
        }
    }
    return schema;
}
