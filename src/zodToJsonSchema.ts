import { ZodSchema } from "zod";
import { Options, Targets } from "./Options.js";
import { parseDef, setSchemaMetaInfo } from "./parseDef.js";
import { JsonSchema7Type } from "./parseTypes.js";
import { getRefs } from "./Refs.js";
import { parseAnyDef } from "./parsers/any.js";

// Function to extract and store meta information from a schema
const extractAndStoreMetaInfo = (schema: any) => {
  if (!schema || !schema._def) return;

  // Extract meta information from the schema
  let metaInfo: any = {};

  // Check for description in Zod V3 way (_def.description)
  if (schema._def && schema._def.description) {
    metaInfo.description = schema._def.description;
  }

  // Check for meta function (from .meta()) - available in Zod V4
  if (typeof schema.meta === "function") {
    try {
      const meta = schema.meta();
      if (meta && typeof meta === "object") {
        metaInfo = { ...metaInfo, ...meta };
      }
    } catch (e) {
      // Ignore errors when calling meta()
    }
  }

  // Also check for description property directly (Zod V4 fallback)
  if (!metaInfo.description && schema.description) {
    metaInfo.description = schema.description;
  }

  // Store the meta information if we found any
  if (Object.keys(metaInfo).length > 0) {
    setSchemaMetaInfo(schema._def, metaInfo);
  }

  // Recursively process nested schemas
  if (schema._def.innerType) {
    extractAndStoreMetaInfo(schema._def.innerType);
  }
  if (schema._def.options && Array.isArray(schema._def.options)) {
    schema._def.options.forEach((option: any) =>
      extractAndStoreMetaInfo(option),
    );
  }
  if (schema._def.left) {
    extractAndStoreMetaInfo(schema._def.left);
  }
  if (schema._def.right) {
    extractAndStoreMetaInfo(schema._def.right);
  }
  if (schema._def.schema) {
    extractAndStoreMetaInfo(schema._def.schema);
  }
  if (schema._def.type) {
    extractAndStoreMetaInfo(schema._def.type);
  }

  // Handle object properties
  if (schema._def.shape && typeof schema._def.shape === "object") {
    Object.values(schema._def.shape).forEach((propSchema: any) => {
      extractAndStoreMetaInfo(propSchema);
    });
  }

  // Handle array elements
  if (schema._def.element) {
    extractAndStoreMetaInfo(schema._def.element);
  }
  // Handle object shapes (properties)
  if (schema._def.shape && typeof schema._def.shape === "object") {
    Object.values(schema._def.shape).forEach((propertySchema: any) => {
      extractAndStoreMetaInfo(propertySchema);
    });
  }
  // Handle array items
  if (schema._def.type && schema._def.type._def) {
    extractAndStoreMetaInfo(schema._def.type);
  }
};

const zodToJsonSchema = <Target extends Targets = "jsonSchema7">(
  schema: ZodSchema<any>,
  options?: Partial<Options<Target>> | string,
): (Target extends "jsonSchema7" ? JsonSchema7Type : object) & {
  $schema?: string;
  definitions?: {
    [key: string]: Target extends "jsonSchema7"
      ? JsonSchema7Type
      : Target extends "jsonSchema2019-09"
        ? JsonSchema7Type
        : object;
  };
} => {
  const refs = getRefs(options);

  // Extract and store meta information from the main schema and any definitions
  extractAndStoreMetaInfo(schema);

  if (typeof options === "object" && options.definitions) {
    Object.values(options.definitions).forEach((defSchema) => {
      extractAndStoreMetaInfo(defSchema);
    });
  }

  let definitions =
    typeof options === "object" && options.definitions
      ? Object.entries(options.definitions).reduce(
          (acc: { [key: string]: JsonSchema7Type }, [name, schema]) => ({
            ...acc,
            [name]:
              parseDef(
                schema._def,
                {
                  ...refs,
                  currentPath: [...refs.basePath, refs.definitionPath, name],
                },
                true,
              ) ?? parseAnyDef(refs),
          }),
          {},
        )
      : undefined;

  const name =
    typeof options === "string"
      ? options
      : options?.nameStrategy === "title"
        ? undefined
        : options?.name;

  const main =
    parseDef(
      schema._def,
      name === undefined
        ? refs
        : {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name],
          },
      false,
    ) ?? (parseAnyDef(refs) as JsonSchema7Type);

  const title =
    typeof options === "object" &&
    options.name !== undefined &&
    options.nameStrategy === "title"
      ? options.name
      : undefined;

  if (title !== undefined) {
    main.title = title;
  }

  if (refs.flags.hasReferencedOpenAiAnyType) {
    if (!definitions) {
      definitions = {};
    }

    if (!definitions[refs.openAiAnyTypeName]) {
      definitions[refs.openAiAnyTypeName] = {
        // Skipping "object" as no properties can be defined and additionalProperties must be "false"
        type: ["string", "number", "integer", "boolean", "array", "null"],
        items: {
          $ref:
            refs.$refStrategy === "relative"
              ? "1"
              : [
                  ...refs.basePath,
                  refs.definitionPath,
                  refs.openAiAnyTypeName,
                ].join("/"),
        },
      } as JsonSchema7Type;
    }
  }

  const combined: ReturnType<typeof zodToJsonSchema<Target>> =
    name === undefined
      ? definitions
        ? {
            ...main,
            [refs.definitionPath]: definitions,
          }
        : main
      : {
          $ref: [
            ...(refs.$refStrategy === "relative" ? [] : refs.basePath),
            refs.definitionPath,
            name,
          ].join("/"),
          [refs.definitionPath]: {
            ...definitions,
            [name]: main,
          },
        };

  if (refs.target === "jsonSchema7") {
    combined.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
    combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
  }

  if (
    refs.target === "openAi" &&
    ("anyOf" in combined ||
      "oneOf" in combined ||
      "allOf" in combined ||
      ("type" in combined && Array.isArray(combined.type)))
  ) {
    console.warn(
      "Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.",
    );
  }

  return combined;
};

export { zodToJsonSchema };
