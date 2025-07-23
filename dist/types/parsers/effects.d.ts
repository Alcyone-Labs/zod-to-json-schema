import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
export declare function parseEffectsDef(_def: any, // Changed from ZodEffectsDef to any for Zod V4 compatibility
refs: Refs): JsonSchema7Type | undefined;
