import { ZodObjectDef, ZodTypeAny } from "../zodV3V4Compat.js";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";

export type JsonSchema7ObjectType = {
  type: "object";
  properties: Record<string, JsonSchema7Type>;
  additionalProperties?: boolean | JsonSchema7Type;
  required?: string[];
};

export function parseObjectDef(def: ZodObjectDef, refs: Refs) {
  const forceOptionalIntoNullable = refs.target === "openAi";

  const result: JsonSchema7ObjectType = {
    type: "object",
    properties: {},
  };

  const required: string[] = [];

  const shape = def.shape;

  for (const propName in shape) {
    let propDef = shape[propName];

    // In Zod V4, the shape contains schema objects with .def instead of ._def
    const propDefInner = propDef.def || propDef._def;
    if (propDef === undefined || propDefInner === undefined) {
      continue;
    }

    let propOptional = safeIsOptional(propDef);

    let parsedDef;

    if (propOptional && forceOptionalIntoNullable) {
      // In Zod V4, we need to check the type property instead of typeName
      const typeName = propDefInner.typeName || propDefInner.type;
      if (typeName === "ZodOptional" || typeName === "optional") {
        // Get the inner type from the optional schema
        const innerType = propDefInner.innerType;
        if (innerType) {
          const innerTypeDef = innerType.def || innerType._def;
          const innerTypeType = innerTypeDef?.type || innerTypeDef?.typeName;

          // Parse the inner type
          const innerParsed = parseDef(innerTypeDef, {
            ...refs,
            currentPath: [...refs.currentPath, "properties", propName],
            propertyPath: [...refs.currentPath, "properties", propName],
          });

          // Convert to nullable type for OpenAI mode
          if (
            innerParsed &&
            typeof innerParsed === "object" &&
            "type" in innerParsed
          ) {
            if (typeof innerParsed.type === "string") {
              parsedDef = {
                ...innerParsed,
                type: [innerParsed.type, "null"],
              };
            } else {
              parsedDef = innerParsed;
            }
          } else {
            parsedDef = innerParsed;
          }
        }
      }

      propOptional = false; // Make it required in OpenAI mode
    } else {
      parsedDef = parseDef(propDefInner, {
        ...refs,
        currentPath: [...refs.currentPath, "properties", propName],
        propertyPath: [...refs.currentPath, "properties", propName],
      });
    }

    if (parsedDef === undefined) {
      continue;
    }

    result.properties[propName] = parsedDef as JsonSchema7Type;

    if (!propOptional) {
      required.push(propName);
    }
  }

  if (required.length) {
    result.required = required;
  }

  const additionalProperties = decideAdditionalProperties(def, refs);

  if (additionalProperties !== undefined) {
    result.additionalProperties = additionalProperties;
  }

  return result;
}

function decideAdditionalProperties(def: any, refs: Refs) {
  // In Zod V4, check catchall property
  if (def.catchall) {
    const catchallDef = def.catchall.def || def.catchall._def;
    const catchallType = catchallDef?.type || catchallDef?.typeName;

    if (catchallType === "never" || catchallType === "ZodNever") {
      // Strict mode - no additional properties
      return refs.rejectedAdditionalProperties;
    } else if (catchallType === "unknown" || catchallType === "ZodUnknown") {
      // Passthrough mode - allow additional properties
      return refs.allowedAdditionalProperties;
    } else {
      // Custom catchall type
      return parseDef(catchallDef, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"],
      });
    }
  }

  // Fallback to unknownKeys for backward compatibility
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict"
        ? refs.allowedAdditionalProperties
        : refs.rejectedAdditionalProperties;
  }

  // Default behavior for regular objects without explicit catchall
  // When removeAdditionalStrategy is "strict", regular objects should allow additional properties
  // unless they are explicitly made strict (which would have a catchall with "never")
  return refs.removeAdditionalStrategy === "strict"
    ? refs.allowedAdditionalProperties
    : refs.rejectedAdditionalProperties;
}

function safeIsOptional(schema: ZodTypeAny): boolean {
  try {
    return schema.isOptional();
  } catch {
    return true;
  }
}
