import { ZodTypeDef } from "./zodV3V4Compat.js";
import { Refs } from "./Refs.js";
import { JsonSchema7Type } from "./parseTypes.js";
export declare const setSchemaMetaInfo: (def: any, metaInfo: any) => void;
export declare const getSchemaMetaInfo: (def: any) => any;
export declare function parseDef(def: ZodTypeDef, refs: Refs, forceResolution?: boolean): JsonSchema7Type | undefined;
