/**
 * Comprehensive Zod V3/V4 Compatibility Layer
 *
 * This file provides a complete compatibility interface that can be used as a drop-in
 * replacement for Zod imports throughout the codebase, ensuring compatibility between
 * Zod V3 and V4 without requiring changes to individual parser files.
 */
export { ZodSchema } from "zod";
export type { ZodTypeAny } from "zod";
export type ZodTypeDef = any;
export type ZodStringDef = any;
export type ZodNumberDef = any;
export type ZodBigIntDef = any;
export type ZodBooleanDef = any;
export type ZodDateDef = any;
export type ZodUndefinedDef = any;
export type ZodNullDef = any;
export type ZodVoidDef = any;
export type ZodAnyDef = any;
export type ZodUnknownDef = any;
export type ZodNeverDef = any;
export type ZodArrayDef = any;
export type ZodObjectDef = any;
export type ZodUnionDef = any;
export type ZodDiscriminatedUnionDef<T = any, K = any> = any;
export type ZodIntersectionDef = any;
export type ZodTupleDef<T = any, R = any> = any;
export type ZodRecordDef<K = any, V = any> = any;
export type ZodMapDef = any;
export type ZodSetDef = any;
export type ZodFunctionDef = any;
export type ZodLazyDef = any;
export type ZodLiteralDef = any;
export type ZodEnumDef = any;
export type ZodNativeEnumDef = any;
export type ZodPromiseDef = any;
export type ZodEffectsDef = any;
export type ZodOptionalDef = any;
export type ZodNullableDef = any;
export type ZodDefaultDef = any;
export type ZodCatchDef<T = any> = any;
export type ZodReadonlyDef<T = any> = any;
export type ZodBrandedDef = any;
export type ZodPipelineDef = any;
export type ZodTupleItems = any;
export declare const ZodFirstPartyTypeKind: any;
/**
 * Get the type name from a schema definition, compatible with both V3 and V4
 * V3: uses _def.typeName
 * V4: uses _def.type
 */
export declare function getDefTypeName(def: any): string | undefined;
/**
 * Get the inner type definition from a wrapper type (nullable, optional, etc.)
 * V3: uses innerType._def
 * V4: uses innerType.def (but also has _def for compatibility)
 */
export declare function getInnerTypeDef(wrapperDef: any): any;
/**
 * Check if a schema definition represents a nullable type
 */
export declare function isNullableType(def: any): boolean;
/**
 * Check if a schema definition represents an optional type
 */
export declare function isOptionalType(def: any): boolean;
/**
 * Get all primitive type names for both V3 and V4
 */
export declare function getAllPrimitiveTypeNames(): string[];
/**
 * Extract metadata from a schema, compatible with both V3 and V4
 * V3: stored in _def.description
 * V4: accessed via .meta() method or .description property
 */
export declare function extractMetadata(schema: any): Record<string, any>;
/**
 * Safe access to schema properties across V3/V4
 */
export declare function safeAccess(obj: any, ...paths: string[]): any;
/**
 * Check if two type names represent the same type across V3/V4
 */
export declare function isSameType(typeName1: string, typeName2: string): boolean;
export declare const primitiveMappings: {
    readonly ZodString: "string";
    readonly ZodNumber: "number";
    readonly ZodBigInt: "string";
    readonly ZodBoolean: "boolean";
    readonly ZodNull: "null";
    readonly string: "string";
    readonly number: "number";
    readonly bigint: "string";
    readonly boolean: "boolean";
    readonly null: "null";
};
