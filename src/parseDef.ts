import {
  ZodTypeDef,
  getDefTypeName,
  getInnerTypeDef,
  isNullableType,
} from "./zodV3V4Compat.js";
import { Refs, Seen } from "./Refs.js";
import { ignoreOverride } from "./Options.js";
import { JsonSchema7Type } from "./parseTypes.js";
import { selectParser } from "./selectParser.js";
import { getRelativePath } from "./getRelativePath.js";
import { parseAnyDef } from "./parsers/any.js";

// WeakMap to store meta information for schemas
const schemaMetaMap = new WeakMap<any, any>();

export const setSchemaMetaInfo = (def: any, metaInfo: any) => {
  schemaMetaMap.set(def, metaInfo);
};

export const getSchemaMetaInfo = (def: any) => {
  return schemaMetaMap.get(def);
};

export function parseDef(
  def: ZodTypeDef,
  refs: Refs,
  forceResolution = false, // Forces a new schema to be instantiated even though its def has been seen. Used for improving refs in definitions. See https://github.com/StefanTerdell/zod-to-json-schema/pull/61.
): JsonSchema7Type | undefined {
  const seenItem = refs.seen.get(def);

  if (refs.override) {
    const overrideResult = refs.override?.(
      def,
      refs,
      seenItem,
      forceResolution,
    );

    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }

  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);

    if (seenSchema !== undefined) {
      // Special handling for nullable schemas in OpenAPI mode
      const typeName = getDefTypeName(def);
      if (
        isNullableType(def) &&
        refs.target === "openApi3" &&
        "$ref" in seenSchema
      ) {
        const metaInfo = getSchemaMetaInfo(def);
        const innerTypeDef = getInnerTypeDef(def);
        const innerSeenItem = innerTypeDef ? refs.seen.get(innerTypeDef) : null;

        // Check if this nullable schema or its inner type has metadata
        const hasOwnDescription = metaInfo?.description;
        const innerMetaInfo = innerTypeDef
          ? getSchemaMetaInfo(innerTypeDef)
          : null;
        const hasInnerDescription = innerMetaInfo?.description;

        // Check if the referenced definition has a description
        let referencedDefinitionDescription: string | undefined;
        if (innerSeenItem && innerSeenItem.path.includes(refs.definitionPath)) {
          const defName = innerSeenItem.path[innerSeenItem.path.length - 1];
          const definitionSchema = refs.definitions[defName];
          if (definitionSchema) {
            // Try to get description directly from the schema
            if (typeof definitionSchema.meta === "function") {
              try {
                const meta = definitionSchema.meta();
                if (meta && meta.description) {
                  referencedDefinitionDescription = meta.description;
                }
              } catch (e) {
                // Ignore errors
              }
            }
            // Fallback to direct description property
            if (
              !referencedDefinitionDescription &&
              definitionSchema.description
            ) {
              referencedDefinitionDescription = definitionSchema.description;
            }
          }
        }

        // If the nullable schema has its own description, inner type has description,
        // or the referenced definition has description, create the allOf wrapper.
        // Otherwise, return simple $ref for reuse.
        if (
          hasOwnDescription ||
          hasInnerDescription ||
          referencedDefinitionDescription
        ) {
          let refToUse = seenSchema;

          // If the inner type has a definition path, use that instead
          if (
            innerSeenItem &&
            innerSeenItem.path.includes(refs.definitionPath)
          ) {
            refToUse = { $ref: innerSeenItem.path.join("/") };
          }

          const result: any = { allOf: [refToUse], nullable: true };

          // Add description based on priority: own description > inner description > referenced definition description
          const currentPathStr = refs.currentPath.join("/");
          if (hasOwnDescription && !currentPathStr.includes("group")) {
            result.description = metaInfo.description;
          } else if (hasInnerDescription && !hasOwnDescription) {
            result.description = innerMetaInfo.description;
          } else if (referencedDefinitionDescription && !hasOwnDescription) {
            result.description = referencedDefinitionDescription;
          }

          return result;
        }

        // For nullable schemas without metadata, subsequent occurrences should just reference the first
        return seenSchema;
      }
      return seenSchema;
    }
  }

  const newItem: Seen = { def, path: refs.currentPath, jsonSchema: undefined };

  refs.seen.set(def, newItem);

  const typeName = getDefTypeName(def);
  const jsonSchemaOrGetter = selectParser(def, typeName, refs);

  // If the return was a function, then the inner definition needs to be extracted before a call to parseDef (recursive)
  const jsonSchema =
    typeof jsonSchemaOrGetter === "function"
      ? parseDef(jsonSchemaOrGetter(), refs)
      : jsonSchemaOrGetter;

  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }

  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema, def, refs);

    newItem.jsonSchema = jsonSchema;

    return postProcessResult;
  }

  newItem.jsonSchema = jsonSchema;

  return jsonSchema;
}

const get$ref = (
  item: Seen,
  refs: Refs,
):
  | {
      $ref: string;
    }
  | {}
  | undefined => {
  switch (refs.$refStrategy) {
    case "root":
      return { $ref: item.path.join("/") };
    case "relative":
      return { $ref: getRelativePath(refs.currentPath, item.path) };
    case "none":
    case "seen": {
      if (
        item.path.length < refs.currentPath.length &&
        item.path.every((value, index) => refs.currentPath[index] === value)
      ) {
        console.warn(
          `Recursive reference detected at ${refs.currentPath.join(
            "/",
          )}! Defaulting to any`,
        );

        return parseAnyDef(refs);
      }

      return refs.$refStrategy === "seen" ? parseAnyDef(refs) : undefined;
    }
  }
};

const addMeta = (
  def: ZodTypeDef,
  refs: Refs,
  jsonSchema: JsonSchema7Type,
): JsonSchema7Type => {
  // Check for description in the Zod V3 way (stored in def.description)
  if ((def as any).description) {
    jsonSchema.description = (def as any).description;

    if (refs.markdownDescription) {
      jsonSchema.markdownDescription = (def as any).description;
    }
  }

  // Check for meta information from Zod V4 extraction process
  const metaInfo = getSchemaMetaInfo(def);
  if (metaInfo) {
    // V4 meta info takes precedence over V3 def.description
    if (metaInfo.description) {
      jsonSchema.description = metaInfo.description;

      if (refs.markdownDescription) {
        jsonSchema.markdownDescription = metaInfo.description;
      }
    }

    // Add other meta properties if they exist (V4 feature)
    if (metaInfo.title) {
      jsonSchema.title = metaInfo.title;
    }
    if (metaInfo.examples) {
      (jsonSchema as any).examples = metaInfo.examples;
    }
    // Add any other meta properties
    for (const [key, value] of Object.entries(metaInfo)) {
      if (key !== "description" && key !== "title" && key !== "examples") {
        (jsonSchema as any)[key] = value;
      }
    }
  }
  return jsonSchema;
};
