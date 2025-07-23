import { ZodFirstPartyTypeKind } from "./zodV3V4Compat.js";
import { parseAnyDef } from "./parsers/any.js";
import { parseArrayDef } from "./parsers/array.js";
import { parseBigintDef } from "./parsers/bigint.js";
import { parseBooleanDef } from "./parsers/boolean.js";
import { parseBrandedDef } from "./parsers/branded.js";
import { parseCatchDef } from "./parsers/catch.js";
import { parseDateDef } from "./parsers/date.js";
import { parseDefaultDef } from "./parsers/default.js";
import { parseEffectsDef } from "./parsers/effects.js";
import { parseEnumDef } from "./parsers/enum.js";
import { parseIntersectionDef } from "./parsers/intersection.js";
import { parseLiteralDef } from "./parsers/literal.js";
import { parseMapDef } from "./parsers/map.js";
import { parseNativeEnumDef } from "./parsers/nativeEnum.js";
import { parseNeverDef } from "./parsers/never.js";
import { parseNullDef } from "./parsers/null.js";
import { parseNullableDef } from "./parsers/nullable.js";
import { parseNumberDef } from "./parsers/number.js";
import { parseObjectDef } from "./parsers/object.js";
import { parseOptionalDef } from "./parsers/optional.js";
import { parsePipelineDef } from "./parsers/pipeline.js";
import { parsePromiseDef } from "./parsers/promise.js";
import { parseRecordDef } from "./parsers/record.js";
import { parseSetDef } from "./parsers/set.js";
import { parseStringDef } from "./parsers/string.js";
import { parseTupleDef } from "./parsers/tuple.js";
import { parseUndefinedDef } from "./parsers/undefined.js";
import { parseUnionDef } from "./parsers/union.js";
import { parseUnknownDef } from "./parsers/unknown.js";
import { parseReadonlyDef } from "./parsers/readonly.js";
export const selectParser = (def, typeName, // Changed from ZodFirstPartyTypeKind to any for Zod V4 compatibility
refs) => {
    // In Zod V4, typeName is undefined and we need to use def.type instead
    const actualType = typeName || def.type;
    switch (actualType) {
        case "ZodString":
        case "string":
            return parseStringDef(def, refs);
        case "ZodNumber":
        case "number":
        case ZodFirstPartyTypeKind.ZodNumber:
            return parseNumberDef(def, refs);
        case "ZodObject":
        case "object":
        case ZodFirstPartyTypeKind.ZodObject:
            return parseObjectDef(def, refs);
        case "ZodBigInt":
        case "bigint":
        case ZodFirstPartyTypeKind.ZodBigInt:
            return parseBigintDef(def, refs);
        case "ZodBoolean":
        case "boolean":
        case ZodFirstPartyTypeKind.ZodBoolean:
            return parseBooleanDef();
        case "ZodDate":
        case "date":
        case ZodFirstPartyTypeKind.ZodDate:
            return parseDateDef(def, refs);
        case "ZodUndefined":
        case "undefined":
        case ZodFirstPartyTypeKind.ZodUndefined:
            return parseUndefinedDef(refs);
        case "ZodNull":
        case "null":
        case ZodFirstPartyTypeKind.ZodNull:
            return parseNullDef(refs);
        case "ZodArray":
        case "array":
        case ZodFirstPartyTypeKind.ZodArray:
            return parseArrayDef(def, refs);
        case "ZodUnion":
        case "union":
        case "ZodDiscriminatedUnion":
        case "discriminatedUnion":
        case ZodFirstPartyTypeKind.ZodUnion:
        case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
            return parseUnionDef(def, refs);
        case "ZodIntersection":
        case "intersection":
        case ZodFirstPartyTypeKind.ZodIntersection:
            return parseIntersectionDef(def, refs);
        case "ZodTuple":
        case "tuple":
        case ZodFirstPartyTypeKind.ZodTuple:
            return parseTupleDef(def, refs);
        case "ZodRecord":
        case "record":
        case ZodFirstPartyTypeKind.ZodRecord:
            return parseRecordDef(def, refs);
        case "ZodLiteral":
        case "literal":
        case ZodFirstPartyTypeKind.ZodLiteral:
            return parseLiteralDef(def, refs);
        case "ZodEnum":
        case "enum":
        case ZodFirstPartyTypeKind.ZodEnum:
            // In Zod V4, both regular and native enums have type "enum"
            // Distinguish by checking if keys === values (regular enum) or keys !== values (native enum)
            if (def.entries) {
                const keys = Object.keys(def.entries);
                const values = Object.values(def.entries);
                const isNativeEnum = !keys.every((k, i) => k === values[i]);
                if (isNativeEnum) {
                    return parseNativeEnumDef(def);
                }
            }
            return parseEnumDef(def);
        case "ZodNativeEnum":
        case "nativeEnum":
        case ZodFirstPartyTypeKind.ZodNativeEnum:
            return parseNativeEnumDef(def);
        case "ZodNullable":
        case "nullable":
        case ZodFirstPartyTypeKind.ZodNullable:
            return parseNullableDef(def, refs);
        case "ZodOptional":
        case "optional":
        case ZodFirstPartyTypeKind.ZodOptional:
            return parseOptionalDef(def, refs);
        case "ZodMap":
        case "map":
        case ZodFirstPartyTypeKind.ZodMap:
            return parseMapDef(def, refs);
        case "ZodSet":
        case "set":
        case ZodFirstPartyTypeKind.ZodSet:
            return parseSetDef(def, refs);
        case "ZodLazy":
        case "lazy":
        case ZodFirstPartyTypeKind.ZodLazy:
            return () => def.getter()._def;
        case "ZodPromise":
        case "promise":
        case ZodFirstPartyTypeKind.ZodPromise:
            return parsePromiseDef(def, refs);
        case "ZodNaN":
        case "nan":
        case "ZodNever":
        case "never":
        case ZodFirstPartyTypeKind.ZodNaN:
        case ZodFirstPartyTypeKind.ZodNever:
            return parseNeverDef(refs);
        case "ZodEffects":
        case "effects":
        case ZodFirstPartyTypeKind.ZodEffects:
            return parseEffectsDef(def, refs);
        case "ZodAny":
        case "any":
        case ZodFirstPartyTypeKind.ZodAny:
            return parseAnyDef(refs);
        case "ZodUnknown":
        case "unknown":
        case ZodFirstPartyTypeKind.ZodUnknown:
            return parseUnknownDef(refs);
        case "ZodDefault":
        case "default":
        case ZodFirstPartyTypeKind.ZodDefault:
            return parseDefaultDef(def, refs);
        case "ZodBranded":
        case "branded":
        case ZodFirstPartyTypeKind.ZodBranded:
            return parseBrandedDef(def, refs);
        case "ZodReadonly":
        case "readonly":
        case ZodFirstPartyTypeKind.ZodReadonly:
            return parseReadonlyDef(def, refs);
        case "ZodCatch":
        case "catch":
        case ZodFirstPartyTypeKind.ZodCatch:
            return parseCatchDef(def, refs);
        case "ZodPipeline":
        case "pipeline":
        case "pipe": // Zod V4 uses "pipe" instead of "pipeline"
        case ZodFirstPartyTypeKind.ZodPipeline:
            return parsePipelineDef(def, refs);
        case "ZodFunction":
        case "function":
        case "ZodVoid":
        case "void":
        case "ZodSymbol":
        case "symbol":
        case ZodFirstPartyTypeKind.ZodFunction:
        case ZodFirstPartyTypeKind.ZodVoid:
        case ZodFirstPartyTypeKind.ZodSymbol:
            return undefined;
        case "custom":
            // Handle z.instanceof() and other custom types - treat as any
            return parseAnyDef(refs);
        default:
            /* c8 ignore next */
            return undefined;
    }
};
