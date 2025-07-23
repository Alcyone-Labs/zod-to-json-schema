"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectParser = void 0;
const zodV3V4Compat_js_1 = require("./zodV3V4Compat.js");
const any_js_1 = require("./parsers/any.js");
const array_js_1 = require("./parsers/array.js");
const bigint_js_1 = require("./parsers/bigint.js");
const boolean_js_1 = require("./parsers/boolean.js");
const branded_js_1 = require("./parsers/branded.js");
const catch_js_1 = require("./parsers/catch.js");
const date_js_1 = require("./parsers/date.js");
const default_js_1 = require("./parsers/default.js");
const effects_js_1 = require("./parsers/effects.js");
const enum_js_1 = require("./parsers/enum.js");
const intersection_js_1 = require("./parsers/intersection.js");
const literal_js_1 = require("./parsers/literal.js");
const map_js_1 = require("./parsers/map.js");
const nativeEnum_js_1 = require("./parsers/nativeEnum.js");
const never_js_1 = require("./parsers/never.js");
const null_js_1 = require("./parsers/null.js");
const nullable_js_1 = require("./parsers/nullable.js");
const number_js_1 = require("./parsers/number.js");
const object_js_1 = require("./parsers/object.js");
const optional_js_1 = require("./parsers/optional.js");
const pipeline_js_1 = require("./parsers/pipeline.js");
const promise_js_1 = require("./parsers/promise.js");
const record_js_1 = require("./parsers/record.js");
const set_js_1 = require("./parsers/set.js");
const string_js_1 = require("./parsers/string.js");
const tuple_js_1 = require("./parsers/tuple.js");
const undefined_js_1 = require("./parsers/undefined.js");
const union_js_1 = require("./parsers/union.js");
const unknown_js_1 = require("./parsers/unknown.js");
const readonly_js_1 = require("./parsers/readonly.js");
const selectParser = (def, typeName, // Changed from ZodFirstPartyTypeKind to any for Zod V4 compatibility
refs) => {
    // In Zod V4, typeName is undefined and we need to use def.type instead
    const actualType = typeName || def.type;
    switch (actualType) {
        case "ZodString":
        case "string":
            return (0, string_js_1.parseStringDef)(def, refs);
        case "ZodNumber":
        case "number":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNumber:
            return (0, number_js_1.parseNumberDef)(def, refs);
        case "ZodObject":
        case "object":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodObject:
            return (0, object_js_1.parseObjectDef)(def, refs);
        case "ZodBigInt":
        case "bigint":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodBigInt:
            return (0, bigint_js_1.parseBigintDef)(def, refs);
        case "ZodBoolean":
        case "boolean":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodBoolean:
            return (0, boolean_js_1.parseBooleanDef)();
        case "ZodDate":
        case "date":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodDate:
            return (0, date_js_1.parseDateDef)(def, refs);
        case "ZodUndefined":
        case "undefined":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodUndefined:
            return (0, undefined_js_1.parseUndefinedDef)(refs);
        case "ZodNull":
        case "null":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNull:
            return (0, null_js_1.parseNullDef)(refs);
        case "ZodArray":
        case "array":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodArray:
            return (0, array_js_1.parseArrayDef)(def, refs);
        case "ZodUnion":
        case "union":
        case "ZodDiscriminatedUnion":
        case "discriminatedUnion":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodUnion:
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
            return (0, union_js_1.parseUnionDef)(def, refs);
        case "ZodIntersection":
        case "intersection":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodIntersection:
            return (0, intersection_js_1.parseIntersectionDef)(def, refs);
        case "ZodTuple":
        case "tuple":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodTuple:
            return (0, tuple_js_1.parseTupleDef)(def, refs);
        case "ZodRecord":
        case "record":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodRecord:
            return (0, record_js_1.parseRecordDef)(def, refs);
        case "ZodLiteral":
        case "literal":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodLiteral:
            return (0, literal_js_1.parseLiteralDef)(def, refs);
        case "ZodEnum":
        case "enum":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodEnum:
            // In Zod V4, both regular and native enums have type "enum"
            // Distinguish by checking if keys === values (regular enum) or keys !== values (native enum)
            if (def.entries) {
                const keys = Object.keys(def.entries);
                const values = Object.values(def.entries);
                const isNativeEnum = !keys.every((k, i) => k === values[i]);
                if (isNativeEnum) {
                    return (0, nativeEnum_js_1.parseNativeEnumDef)(def);
                }
            }
            return (0, enum_js_1.parseEnumDef)(def);
        case "ZodNativeEnum":
        case "nativeEnum":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNativeEnum:
            return (0, nativeEnum_js_1.parseNativeEnumDef)(def);
        case "ZodNullable":
        case "nullable":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNullable:
            return (0, nullable_js_1.parseNullableDef)(def, refs);
        case "ZodOptional":
        case "optional":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodOptional:
            return (0, optional_js_1.parseOptionalDef)(def, refs);
        case "ZodMap":
        case "map":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodMap:
            return (0, map_js_1.parseMapDef)(def, refs);
        case "ZodSet":
        case "set":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodSet:
            return (0, set_js_1.parseSetDef)(def, refs);
        case "ZodLazy":
        case "lazy":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodLazy:
            return () => def.getter()._def;
        case "ZodPromise":
        case "promise":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodPromise:
            return (0, promise_js_1.parsePromiseDef)(def, refs);
        case "ZodNaN":
        case "nan":
        case "ZodNever":
        case "never":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNaN:
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodNever:
            return (0, never_js_1.parseNeverDef)(refs);
        case "ZodEffects":
        case "effects":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodEffects:
            return (0, effects_js_1.parseEffectsDef)(def, refs);
        case "ZodAny":
        case "any":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodAny:
            return (0, any_js_1.parseAnyDef)(refs);
        case "ZodUnknown":
        case "unknown":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodUnknown:
            return (0, unknown_js_1.parseUnknownDef)(refs);
        case "ZodDefault":
        case "default":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodDefault:
            return (0, default_js_1.parseDefaultDef)(def, refs);
        case "ZodBranded":
        case "branded":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodBranded:
            return (0, branded_js_1.parseBrandedDef)(def, refs);
        case "ZodReadonly":
        case "readonly":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodReadonly:
            return (0, readonly_js_1.parseReadonlyDef)(def, refs);
        case "ZodCatch":
        case "catch":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodCatch:
            return (0, catch_js_1.parseCatchDef)(def, refs);
        case "ZodPipeline":
        case "pipeline":
        case "pipe": // Zod V4 uses "pipe" instead of "pipeline"
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodPipeline:
            return (0, pipeline_js_1.parsePipelineDef)(def, refs);
        case "ZodFunction":
        case "function":
        case "ZodVoid":
        case "void":
        case "ZodSymbol":
        case "symbol":
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodFunction:
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodVoid:
        case zodV3V4Compat_js_1.ZodFirstPartyTypeKind.ZodSymbol:
            return undefined;
        case "custom":
            // Handle z.instanceof() and other custom types - treat as any
            return (0, any_js_1.parseAnyDef)(refs);
        default:
            /* c8 ignore next */
            return undefined;
    }
};
exports.selectParser = selectParser;
