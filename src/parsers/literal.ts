import { ZodLiteralDef } from "../zodV3V4Compat.js";
import { Refs } from "../Refs.js";

export type JsonSchema7LiteralType =
  | {
      type: "string" | "number" | "integer" | "boolean";
      const: string | number | boolean;
    }
  | {
      type: "object" | "array";
    };

export function parseLiteralDef(
  def: any, // Changed from ZodLiteralDef to any for Zod V4 compatibility
  refs: Refs,
): JsonSchema7LiteralType {
  // In Zod V4, use values[0] instead of value
  const value = def.values ? def.values[0] : def.value;
  const parsedType = typeof value;

  if (
    parsedType !== "bigint" &&
    parsedType !== "number" &&
    parsedType !== "boolean" &&
    parsedType !== "string"
  ) {
    return {
      type: Array.isArray(value) ? "array" : "object",
    };
  }

  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [value],
    } as any;
  }

  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: value,
  };
}
