import {
  ZodDiscriminatedUnionDef,
  ZodLiteralDef,
  ZodTypeAny,
  ZodUnionDef,
} from "zod";
import { parseDef, getSchemaMetaInfo, setSchemaMetaInfo } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";

export const primitiveMappings = {
  // Zod V3 type names
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null",
  // Zod V4 type names
  string: "string",
  number: "number",
  bigint: "integer",
  boolean: "boolean",
  null: "null",
} as const;
type ZodPrimitive = keyof typeof primitiveMappings;
type JsonSchema7Primitive =
  (typeof primitiveMappings)[keyof typeof primitiveMappings];

export type JsonSchema7UnionType =
  | JsonSchema7PrimitiveUnionType
  | JsonSchema7AnyOfType;

type JsonSchema7PrimitiveUnionType =
  | {
      type: JsonSchema7Primitive | JsonSchema7Primitive[];
    }
  | {
      type: JsonSchema7Primitive | JsonSchema7Primitive[];
      enum: (string | number | bigint | boolean | null)[];
    };

type JsonSchema7AnyOfType = {
  anyOf: JsonSchema7Type[];
};

// Function to extract meta information from a schema (similar to zodToJsonSchema.ts)
const extractMetaInfoForSchema = (schema: any) => {
  if (!schema || !schema._def) return;

  let metaInfo: any = {};

  // Check for description property (from .describe())
  if (schema.description) {
    metaInfo.description = schema.description;
  }

  // Check for meta function (from .meta())
  if (typeof schema.meta === 'function') {
    try {
      const meta = schema.meta();
      if (meta && typeof meta === 'object') {
        metaInfo = { ...metaInfo, ...meta };
      }
    } catch (e) {
      // Ignore errors when calling meta()
    }
  }

  // Store the meta information if we found any
  if (Object.keys(metaInfo).length > 0) {
    setSchemaMetaInfo(schema._def, metaInfo);
  }
};

export function parseUnionDef(
  def: ZodUnionDef | ZodDiscriminatedUnionDef<any, any>,
  refs: Refs,
): JsonSchema7PrimitiveUnionType | JsonSchema7AnyOfType | undefined {
  if (refs.target === "openApi3") return asAnyOf(def, refs);

  const options: readonly ZodTypeAny[] =
    def.options instanceof Map ? Array.from(def.options.values()) : def.options;

  // Extract meta information for each option to ensure descriptions are available
  options.forEach(option => extractMetaInfoForSchema(option));

  // This blocks tries to look ahead a bit to produce nicer looking schemas with type array instead of anyOf.
  if (
    options.every(
      (x) => {
        const typeKey = x._def.typeName || x._def.type;
        return typeKey in primitiveMappings &&
          (!x._def.checks || !x._def.checks.length);
      }
    )
  ) {
    // all types in union are primitive and lack checks, so might as well squash into {type: [...]}

    const types = options.reduce((types: JsonSchema7Primitive[], x) => {
      const typeKey = x._def.typeName || x._def.type;
      const type = primitiveMappings[typeKey as ZodPrimitive];
      return type && !types.includes(type) ? [...types, type] : types;
    }, []);

    return {
      type: types.length > 1 ? types : types[0],
    };
  } else if (
    options.every((x) => {
      const typeKey = x._def.typeName || x._def.type;
      const hasDescription = x.description || getSchemaMetaInfo(x._def)?.description;
      return (typeKey === "ZodLiteral" || typeKey === "literal") && !hasDescription;
    })
  ) {
    // all options literals

    const types = options.reduce(
      (acc: JsonSchema7Primitive[], x: { _def: any }) => {
        // In Zod V4, use values[0] instead of value
        const value = x._def.values ? x._def.values[0] : x._def.value;
        const type = typeof value;
        switch (type) {
          case "string":
          case "number":
          case "boolean":
            return [...acc, type];
          case "bigint":
            return [...acc, "integer" as const];
          case "object":
            if (value === null) return [...acc, "null" as const];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return acc;
        }
      },
      [],
    );

    if (types.length === options.length) {
      // all the literals are primitive, as far as null can be considered primitive

      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce(
          (acc, x) => {
            // In Zod V4, use values[0] instead of value
            const value = x._def.values ? x._def.values[0] : x._def.value;
            return acc.includes(value) ? acc : [...acc, value];
          },
          [] as (string | number | bigint | boolean | null)[],
        ),
      };
    }
  } else if (options.every((x) => {
    const typeKey = x._def.typeName || x._def.type;
    return typeKey === "ZodEnum" || typeKey === "enum";
  })) {
    return {
      type: "string",
      enum: options.reduce(
        (acc: string[], x) => {
          // In Zod V4, use entries instead of values
          const values = x._def.entries ? Object.values(x._def.entries) : x._def.values;
          return [
            ...acc,
            ...values.filter((x: string) => !acc.includes(x)),
          ];
        },
        [],
      ),
    };
  }

  return asAnyOf(def, refs);
}

const asAnyOf = (
  def: ZodUnionDef | ZodDiscriminatedUnionDef<any, any>,
  refs: Refs,
): JsonSchema7PrimitiveUnionType | JsonSchema7AnyOfType | undefined => {
  const anyOf = (
    (def.options instanceof Map
      ? Array.from(def.options.values())
      : def.options) as any[]
  )
    .map((x, i) =>
      parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", `${i}`],
      }),
    )
    .filter(
      (x): x is JsonSchema7Type =>
        !!x &&
        (!refs.strictUnions ||
          (typeof x === "object" && Object.keys(x).length > 0)),
    );

  return anyOf.length ? { anyOf } : undefined;
};
