import {
  ZodFirstPartyTypeKind,
  ZodMapDef,
  ZodRecordDef,
  ZodTypeAny,
} from "zod";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";
import { JsonSchema7EnumType } from "./enum.js";
import { JsonSchema7ObjectType } from "./object.js";
import { JsonSchema7StringType, parseStringDef } from "./string.js";
import { parseBrandedDef } from "./branded.js";
import { parseAnyDef } from "./any.js";

type JsonSchema7RecordPropertyNamesType =
  | Omit<JsonSchema7StringType, "type">
  | Omit<JsonSchema7EnumType, "type">;

export type JsonSchema7RecordType = {
  type: "object";
  additionalProperties?: JsonSchema7Type | true;
  propertyNames?: JsonSchema7RecordPropertyNamesType;
};

export function parseRecordDef(
  def: ZodRecordDef<ZodTypeAny, ZodTypeAny> | ZodMapDef,
  refs: Refs,
): JsonSchema7RecordType {
  if (refs.target === "openAi") {
    console.warn(
      "Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.",
    );
  }

  // In Zod V4, check for enum type differently
  const keyTypeDef = def.keyType?.def || def.keyType?._def;
  const keyTypeType = keyTypeDef?.type || keyTypeDef?.typeName;

  if (
    refs.target === "openApi3" &&
    (keyTypeType === "enum" || keyTypeType === "ZodEnum")
  ) {
    // In Zod V4, get values from entries or values
    const enumValues = keyTypeDef?.entries ? Object.values(keyTypeDef.entries) : keyTypeDef?.values;
    const valueTypeDef = def.valueType?.def || def.valueType?._def;

    if (enumValues && Array.isArray(enumValues)) {
      return {
        type: "object",
        required: enumValues,
        properties: enumValues.reduce(
          (acc: Record<string, JsonSchema7Type>, key: string) => ({
            ...acc,
            [key]:
              parseDef(valueTypeDef, {
                ...refs,
                currentPath: [...refs.currentPath, "properties", key],
              }) ?? parseAnyDef(refs),
          }),
          {},
        ),
        additionalProperties: refs.rejectedAdditionalProperties,
      } satisfies JsonSchema7ObjectType as any;
    }
  }

  // In Zod V4, if there's no valueType, the keyType is actually the value type
  const actualValueType = def.valueType || def.keyType;
  const valueTypeDef = actualValueType?.def || actualValueType?._def;

  const schema: JsonSchema7RecordType = {
    type: "object",
    additionalProperties:
      valueTypeDef ? parseDef(valueTypeDef, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"],
      }) : refs.allowedAdditionalProperties,
  };

  if (refs.target === "openApi3") {
    return schema;
  }

  if (
    (keyTypeType === "string" || keyTypeType === "ZodString") &&
    keyTypeDef?.checks?.length
  ) {
    const { type, ...keyType } = parseStringDef(keyTypeDef, refs);

    return {
      ...schema,
      propertyNames: keyType,
    };
  } else if (keyTypeType === "enum" || keyTypeType === "ZodEnum") {
    const enumValues = keyTypeDef?.entries ? Object.values(keyTypeDef.entries) : keyTypeDef?.values;
    return {
      ...schema,
      propertyNames: {
        enum: enumValues,
      },
    };
  } else if (
    (keyTypeType === "branded" || keyTypeType === "ZodBranded") &&
    keyTypeDef?.type
  ) {
    const brandedTypeDef = keyTypeDef.type?.def || keyTypeDef.type?._def;
    const brandedTypeType = brandedTypeDef?.type || brandedTypeDef?.typeName;

    if (
      (brandedTypeType === "string" || brandedTypeType === "ZodString") &&
      brandedTypeDef?.checks?.length
    ) {
      const { type, ...keyType } = parseBrandedDef(
        keyTypeDef,
        refs,
      ) as JsonSchema7StringType;

      return {
        ...schema,
        propertyNames: keyType,
      };
    }
  }

  return schema;
}
