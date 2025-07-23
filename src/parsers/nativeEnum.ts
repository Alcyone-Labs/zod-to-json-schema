import { ZodNativeEnumDef } from "../zodV3V4Compat.js";

export type JsonSchema7NativeEnumType = {
  type: "string" | "number" | ["string", "number"];
  enum: (string | number)[];
};

export function parseNativeEnumDef(
  def: any, // Changed from ZodNativeEnumDef to any for Zod V4 compatibility
): JsonSchema7NativeEnumType {
  // In Zod V4, use entries instead of values
  const object = def.entries || def.values;
  const actualKeys = Object.keys(object).filter((key: string) => {
    return typeof object[object[key]] !== "number";
  });

  const actualValues = actualKeys.map((key: string) => object[key]);

  const parsedTypes = Array.from(
    new Set(actualValues.map((values: string | number) => typeof values)),
  );

  return {
    type:
      parsedTypes.length === 1
        ? parsedTypes[0] === "string"
          ? "string"
          : "number"
        : ["string", "number"],
    enum: actualValues,
  };
}
