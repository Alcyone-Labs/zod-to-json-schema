import { Refs } from "./Refs.js";
import { JsonSchema7Type } from "./parseTypes.js";
export type InnerDefGetter = () => any;
export declare const selectParser: (def: any, typeName: any, // Changed from ZodFirstPartyTypeKind to any for Zod V4 compatibility
refs: Refs) => JsonSchema7Type | undefined | InnerDefGetter;
