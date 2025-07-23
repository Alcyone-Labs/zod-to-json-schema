import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
export type JsonSchema7TupleType = {
    type: "array";
    minItems: number;
    items: JsonSchema7Type[];
} & ({
    maxItems: number;
} | {
    additionalItems?: JsonSchema7Type;
});
export declare function parseTupleDef(def: any, // ZodTupleDef compatibility for V3/V4
refs: Refs): JsonSchema7TupleType;
