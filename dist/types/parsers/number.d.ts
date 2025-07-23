import { ErrorMessages } from "../errorMessages.js";
import { Refs } from "../Refs.js";
export type JsonSchema7NumberType = {
    type: "number" | "integer";
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
};
export declare function parseNumberDef(def: any, // Changed from ZodNumberDef to any for Zod V4 compatibility
refs: Refs): JsonSchema7NumberType;
