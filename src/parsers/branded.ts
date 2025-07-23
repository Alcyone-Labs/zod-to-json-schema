import { ZodBrandedDef } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";

export function parseBrandedDef(_def: any, refs: Refs) { // Changed from ZodBrandedDef to any for Zod V4 compatibility
  // In Zod V4, branded types might not have a separate type property
  // They might just be the underlying type with TypeScript-level branding
  if (_def.type && _def.type._def) {
    // Old Zod V3 structure
    return parseDef(_def.type._def, refs);
  } else {
    // Zod V4 structure - just parse the def directly as it's the underlying type
    return parseDef(_def, refs);
  }
}
