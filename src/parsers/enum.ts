import { ZodEnumDef } from "../zodV3V4Compat.js";

export type JsonSchema7EnumType = {
  type: "string";
  enum: string[];
};

export function parseEnumDef(def: any): JsonSchema7EnumType {
  // In Zod V4, use entries instead of values
  const values = def.entries ? Object.values(def.entries) : def.values;
  return {
    type: "string",
    enum: Array.from(values),
  };
}
