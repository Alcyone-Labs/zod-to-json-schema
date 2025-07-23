import { ZodDefaultDef } from "../zodV3V4Compat.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
export declare function parseDefaultDef(_def: ZodDefaultDef, refs: Refs): JsonSchema7Type & {
    default: any;
};
