import { Refs } from "../Refs.js";
export type JsonSchema7LiteralType = {
    type: "string" | "number" | "integer" | "boolean";
    const: string | number | boolean;
} | {
    type: "object" | "array";
};
export declare function parseLiteralDef(def: any, // Changed from ZodLiteralDef to any for Zod V4 compatibility
refs: Refs): JsonSchema7LiteralType;
