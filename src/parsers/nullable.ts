import {
  ZodNullableDef,
  getInnerTypeDef,
  getDefTypeName,
  getAllPrimitiveTypeNames,
  primitiveMappings,
} from "../zodV3V4Compat.js";
import { parseDef, getSchemaMetaInfo } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
import { JsonSchema7NullType } from "./null.js";

export type JsonSchema7NullableType =
  | {
      anyOf: [JsonSchema7Type, JsonSchema7NullType];
    }
  | {
      type: [string, "null"];
    };

export function parseNullableDef(
  def: ZodNullableDef,
  refs: Refs,
): JsonSchema7NullableType | undefined {
  const innerTypeDef = getInnerTypeDef(def);
  const innerTypeKey = getDefTypeName(innerTypeDef);

  if (
    innerTypeKey &&
    getAllPrimitiveTypeNames().includes(innerTypeKey) &&
    (!innerTypeDef.checks || !innerTypeDef.checks.length)
  ) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[innerTypeKey as keyof typeof primitiveMappings],
        nullable: true,
      } as any;
    }

    return {
      type: [
        primitiveMappings[innerTypeKey as keyof typeof primitiveMappings],
        "null",
      ],
    };
  }

  if (refs.target === "openApi3") {
    const base = parseDef(innerTypeDef, {
      ...refs,
      currentPath: [...refs.currentPath],
    });

    if (base && "$ref" in base) {
      const result = { allOf: [base], nullable: true } as any;

      // Try to get description from the referenced definition
      const refPath = base.$ref;
      if (refPath && refPath.includes(refs.definitionPath)) {
        const pathParts = refPath.split("/");
        const defName = pathParts[pathParts.length - 1];
        const definitionSchema = refs.definitions[defName];

        if (definitionSchema) {
          let description: string | undefined;

          // Try to get description via meta() method
          if (typeof definitionSchema.meta === "function") {
            try {
              const meta = definitionSchema.meta();
              if (meta && meta.description) {
                description = meta.description;
              }
            } catch (e) {
              // Ignore errors
            }
          }

          // Fallback to direct description property
          if (!description && definitionSchema.description) {
            description = definitionSchema.description;
          }

          if (description) {
            result.description = description;
          }
        }
      }

      return result;
    }

    return base && ({ ...base, nullable: true } as any);
  }

  const base = parseDef(innerTypeDef, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"],
  });

  return base && { anyOf: [base, { type: "null" }] };
}
