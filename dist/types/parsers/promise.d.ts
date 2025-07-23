import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
export declare function parsePromiseDef(def: any, // Changed from ZodPromiseDef to any for Zod V4 compatibility
refs: Refs): JsonSchema7Type | undefined;
