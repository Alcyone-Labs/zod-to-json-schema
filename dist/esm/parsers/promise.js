import { parseDef } from "../parseDef.js";
export function parsePromiseDef(def, // Changed from ZodPromiseDef to any for Zod V4 compatibility
refs) {
    // In Zod V4, use innerType instead of type, and .def instead of ._def
    const innerType = def.innerType || def.type;
    const innerDef = innerType?.def || innerType?._def;
    return parseDef(innerDef, refs);
}
