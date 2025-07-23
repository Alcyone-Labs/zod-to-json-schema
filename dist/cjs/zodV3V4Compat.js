"use strict";
/**
 * Comprehensive Zod V3/V4 Compatibility Layer
 *
 * This file provides a complete compatibility interface that can be used as a drop-in
 * replacement for Zod imports throughout the codebase, ensuring compatibility between
 * Zod V3 and V4 without requiring changes to individual parser files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitiveMappings = exports.ZodFirstPartyTypeKind = void 0;
exports.getDefTypeName = getDefTypeName;
exports.getInnerTypeDef = getInnerTypeDef;
exports.isNullableType = isNullableType;
exports.isOptionalType = isOptionalType;
exports.getAllPrimitiveTypeNames = getAllPrimitiveTypeNames;
exports.extractMetadata = extractMetadata;
exports.safeAccess = safeAccess;
exports.isSameType = isSameType;
// Try to import ZodFirstPartyTypeKind, but provide fallback
let ZodFirstPartyTypeKindFromZod;
try {
    const zodImport = require("zod");
    ZodFirstPartyTypeKindFromZod = zodImport.ZodFirstPartyTypeKind;
}
catch {
    // Fallback - will be handled below
}
// ==============================================================================
// ZODFIRSTPARTYTYPEKIND COMPATIBILITY
// ==============================================================================
// Create a comprehensive ZodFirstPartyTypeKind that works with both V3 and V4
exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKindFromZod ||
    {
        // V3 style names
        ZodString: "ZodString",
        ZodNumber: "ZodNumber",
        ZodBigInt: "ZodBigInt",
        ZodBoolean: "ZodBoolean",
        ZodDate: "ZodDate",
        ZodUndefined: "ZodUndefined",
        ZodNull: "ZodNull",
        ZodVoid: "ZodVoid",
        ZodAny: "ZodAny",
        ZodUnknown: "ZodUnknown",
        ZodNever: "ZodNever",
        ZodArray: "ZodArray",
        ZodObject: "ZodObject",
        ZodUnion: "ZodUnion",
        ZodDiscriminatedUnion: "ZodDiscriminatedUnion",
        ZodIntersection: "ZodIntersection",
        ZodTuple: "ZodTuple",
        ZodRecord: "ZodRecord",
        ZodMap: "ZodMap",
        ZodSet: "ZodSet",
        ZodFunction: "ZodFunction",
        ZodLazy: "ZodLazy",
        ZodLiteral: "ZodLiteral",
        ZodEnum: "ZodEnum",
        ZodNativeEnum: "ZodNativeEnum",
        ZodPromise: "ZodPromise",
        ZodEffects: "ZodEffects",
        ZodOptional: "ZodOptional",
        ZodNullable: "ZodNullable",
        ZodDefault: "ZodDefault",
        ZodCatch: "ZodCatch",
        ZodReadonly: "ZodReadonly",
        ZodBranded: "ZodBranded",
        ZodPipeline: "ZodPipeline",
        // V4 style names (for forward compatibility)
        string: "string",
        number: "number",
        bigint: "bigint",
        boolean: "boolean",
        date: "date",
        undefined: "undefined",
        null: "null",
        void: "void",
        any: "any",
        unknown: "unknown",
        never: "never",
        array: "array",
        object: "object",
        union: "union",
        discriminated_union: "discriminated_union",
        intersection: "intersection",
        tuple: "tuple",
        record: "record",
        map: "map",
        set: "set",
        function: "function",
        lazy: "lazy",
        literal: "literal",
        enum: "enum",
        nativeEnum: "nativeEnum",
        promise: "promise",
        effects: "effects",
        optional: "optional",
        nullable: "nullable",
        default: "default",
        catch: "catch",
        readonly: "readonly",
        branded: "branded",
        pipeline: "pipeline",
    };
// ==============================================================================
// COMPATIBILITY UTILITY FUNCTIONS
// ==============================================================================
/**
 * Get the type name from a schema definition, compatible with both V3 and V4
 * V3: uses _def.typeName
 * V4: uses _def.type
 */
function getDefTypeName(def) {
    return def?.typeName || def?.type;
}
/**
 * Get the inner type definition from a wrapper type (nullable, optional, etc.)
 * V3: uses innerType._def
 * V4: uses innerType.def (but also has _def for compatibility)
 */
function getInnerTypeDef(wrapperDef) {
    if (!wrapperDef?.innerType)
        return undefined;
    return wrapperDef.innerType.def || wrapperDef.innerType._def;
}
/**
 * Check if a schema definition represents a nullable type
 */
function isNullableType(def) {
    const typeName = getDefTypeName(def);
    return typeName === "nullable" || typeName === "ZodNullable";
}
/**
 * Check if a schema definition represents an optional type
 */
function isOptionalType(def) {
    const typeName = getDefTypeName(def);
    return typeName === "optional" || typeName === "ZodOptional";
}
/**
 * Get all primitive type names for both V3 and V4
 */
function getAllPrimitiveTypeNames() {
    return [
        // V3 names
        "ZodString",
        "ZodNumber",
        "ZodBigInt",
        "ZodBoolean",
        "ZodNull",
        // V4 names
        "string",
        "number",
        "bigint",
        "boolean",
        "null",
    ];
}
/**
 * Extract metadata from a schema, compatible with both V3 and V4
 * V3: stored in _def.description
 * V4: accessed via .meta() method or .description property
 */
function extractMetadata(schema) {
    let metadata = {};
    // V3 style: check _def for description
    if (schema?._def?.description) {
        metadata.description = schema._def.description;
    }
    // V4 style: .meta() method
    if (typeof schema?.meta === "function") {
        try {
            const meta = schema.meta();
            if (meta && typeof meta === "object") {
                metadata = { ...metadata, ...meta };
            }
        }
        catch {
            // Ignore errors when calling meta()
        }
    }
    // V4 fallback: direct properties
    if (!metadata.description && schema?.description) {
        metadata.description = schema.description;
    }
    return metadata;
}
/**
 * Safe access to schema properties across V3/V4
 */
function safeAccess(obj, ...paths) {
    let current = obj;
    for (const path of paths) {
        if (current && typeof current === "object" && path in current) {
            current = current[path];
        }
        else {
            return undefined;
        }
    }
    return current;
}
/**
 * Check if two type names represent the same type across V3/V4
 */
function isSameType(typeName1, typeName2) {
    if (typeName1 === typeName2)
        return true;
    // Map V3 to V4 equivalents
    const typeMapping = {
        ZodString: "string",
        ZodNumber: "number",
        ZodBigInt: "bigint",
        ZodBoolean: "boolean",
        ZodDate: "date",
        ZodUndefined: "undefined",
        ZodNull: "null",
        ZodVoid: "void",
        ZodAny: "any",
        ZodUnknown: "unknown",
        ZodNever: "never",
        ZodArray: "array",
        ZodObject: "object",
        ZodUnion: "union",
        ZodDiscriminatedUnion: "discriminated_union",
        ZodIntersection: "intersection",
        ZodTuple: "tuple",
        ZodRecord: "record",
        ZodMap: "map",
        ZodSet: "set",
        ZodFunction: "function",
        ZodLazy: "lazy",
        ZodLiteral: "literal",
        ZodEnum: "enum",
        ZodNativeEnum: "nativeEnum",
        ZodPromise: "promise",
        ZodEffects: "effects",
        ZodOptional: "optional",
        ZodNullable: "nullable",
        ZodDefault: "default",
        ZodCatch: "catch",
        ZodReadonly: "readonly",
        ZodBranded: "branded",
        ZodPipeline: "pipeline",
    };
    return (typeMapping[typeName1] === typeName2 || typeMapping[typeName2] === typeName1);
}
// ==============================================================================
// PRIMITIVE MAPPINGS (FOR NULLABLE PARSER AND OTHERS)
// ==============================================================================
exports.primitiveMappings = {
    // V3 mappings
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "string", // BigInt is represented as string in JSON
    ZodBoolean: "boolean",
    ZodNull: "null",
    // V4 mappings
    string: "string",
    number: "number",
    bigint: "string", // BigInt is represented as string in JSON
    boolean: "boolean",
    null: "null",
};
