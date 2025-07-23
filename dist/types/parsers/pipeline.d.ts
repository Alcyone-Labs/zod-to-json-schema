import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
import { JsonSchema7AllOfType } from "./intersection.js";
export declare const parsePipelineDef: (def: any, // Changed from ZodPipelineDef to any for Zod V4 compatibility
refs: Refs) => JsonSchema7AllOfType | JsonSchema7Type | undefined;
