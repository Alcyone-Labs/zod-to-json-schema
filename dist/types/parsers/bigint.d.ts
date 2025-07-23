import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
export type JsonSchema7BigintType = {
    type: "integer";
    format: "int64";
    minimum?: BigInt;
    exclusiveMinimum?: BigInt;
    maximum?: BigInt;
    exclusiveMaximum?: BigInt;
    multipleOf?: BigInt;
    errorMessage?: ErrorMessages<JsonSchema7BigintType>;
};
export declare function parseBigintDef(def: any, // Changed from ZodBigIntDef to any for Zod V4 compatibility
refs: Refs): JsonSchema7BigintType;
