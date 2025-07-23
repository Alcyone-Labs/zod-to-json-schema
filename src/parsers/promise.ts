import { ZodPromiseDef } from "zod";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";

export function parsePromiseDef(
  def: any, // Changed from ZodPromiseDef to any for Zod V4 compatibility
  refs: Refs,
): JsonSchema7Type | undefined {
  // In Zod V4, use innerType instead of type, and .def instead of ._def
  const innerType = def.innerType || def.type;
  const innerDef = innerType?.def || innerType?._def;
  return parseDef(innerDef, refs);
}
