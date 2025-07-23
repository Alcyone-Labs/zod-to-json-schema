import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
import { JsonSchema7NumberType } from "./number.js";
import { DateStrategy } from "../Options.js";
export type JsonSchema7DateType = {
    type: "integer" | "string";
    format: "unix-time" | "date-time" | "date";
    minimum?: number;
    maximum?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
} | {
    anyOf: JsonSchema7DateType[];
};
export declare function parseDateDef(def: any, // Changed from ZodDateDef to any for Zod V4 compatibility
refs: Refs, overrideDateStrategy?: DateStrategy): JsonSchema7DateType;
