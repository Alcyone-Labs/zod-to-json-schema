import { ZodEffectsDef } from "zod";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
import { parseAnyDef } from "./any.js";

export function parseEffectsDef(
  _def: any, // Changed from ZodEffectsDef to any for Zod V4 compatibility
  refs: Refs,
): JsonSchema7Type | undefined {
  // In Zod V4, effects might be represented differently
  // For transforms, we might have a pipe structure
  if (_def.type === "pipe") {
    // This is a transform (pipe) - handle in pipeline parser
    return refs.effectStrategy === "input"
      ? parseDef(_def.in?.def || _def.in?._def, refs)
      : parseAnyDef(refs);
  }

  // For backward compatibility with Zod V3 effects
  if (_def.schema) {
    return refs.effectStrategy === "input"
      ? parseDef(_def.schema._def || _def.schema.def, refs)
      : parseAnyDef(refs);
  }

  // If no schema found, return any
  return parseAnyDef(refs);
}
