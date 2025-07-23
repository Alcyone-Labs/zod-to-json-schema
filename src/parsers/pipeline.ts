import { ZodPipelineDef } from "../zodV3V4Compat.js";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
import { JsonSchema7AllOfType } from "./intersection.js";

export const parsePipelineDef = (
  def: any, // Changed from ZodPipelineDef to any for Zod V4 compatibility
  refs: Refs,
): JsonSchema7AllOfType | JsonSchema7Type | undefined => {
  // In Zod V4, use .def instead of ._def for inner types
  const inDef = def.in?.def || def.in?._def;
  const outDef = def.out?.def || def.out?._def;

  // Check if this is a transform/preprocess operation (effect-like)
  // In Zod V4, transforms have one side with type "transform"
  const isTransformLike =
    (inDef?.type === "transform") ||
    (outDef?.type === "transform");

  // For transform-like operations, use effectStrategy instead of pipeStrategy
  if (isTransformLike) {
    if (refs.effectStrategy === "input") {
      // For preprocess: in=transform, out=target -> use out (target)
      // For transform: in=source, out=transform -> use in (source)
      return inDef?.type === "transform"
        ? parseDef(outDef, refs)  // preprocess case
        : parseDef(inDef, refs);  // transform case
    } else {
      // effectStrategy === "any"
      return {}; // Return empty schema for "any" strategy
    }
  }

  // Regular pipe handling
  if (refs.pipeStrategy === "input") {
    return parseDef(inDef, refs);
  } else if (refs.pipeStrategy === "output") {
    return parseDef(outDef, refs);
  }

  const a = parseDef(inDef, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"],
  });
  const b = parseDef(outDef, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"],
  });

  return {
    allOf: [a, b].filter((x): x is JsonSchema7Type => x !== undefined),
  };
};
