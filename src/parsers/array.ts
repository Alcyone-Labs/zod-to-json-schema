import { ZodArrayDef, ZodFirstPartyTypeKind } from "../zodV3V4Compat.js";
import { ErrorMessages, setResponseValueAndErrors } from "../errorMessages.js";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";

export type JsonSchema7ArrayType = {
  type: "array";
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
  errorMessages?: ErrorMessages<JsonSchema7ArrayType, "items">;
};

export function parseArrayDef(def: any, refs: Refs) {
  // Changed from ZodArrayDef to any for Zod V4 compatibility
  const res: JsonSchema7ArrayType = {
    type: "array",
  };

  // In Zod V4, use element instead of type, and .def instead of ._def
  const elementType = def.element || def.type;
  const elementDef = elementType?.def || elementType?._def;
  const elementTypeName = elementDef?.type || elementDef?.typeName;

  if (elementDef && elementTypeName !== "any" && elementTypeName !== "ZodAny") {
    res.items = parseDef(elementDef, {
      ...refs,
      currentPath: [...refs.currentPath, "items"],
    });
  }

  // Handle Zod V4 checks array
  if (def.checks) {
    for (const check of def.checks) {
      const checkDef = check._zod?.def;
      if (checkDef) {
        // Get error message from error function if available
        let message = checkDef.message;
        if (
          !message &&
          checkDef.error &&
          typeof checkDef.error === "function"
        ) {
          try {
            message = checkDef.error();
          } catch (e) {
            // Ignore error, use undefined message
          }
        }

        switch (checkDef.check) {
          case "min_length":
            setResponseValueAndErrors(
              res,
              "minItems",
              checkDef.minimum,
              message,
              refs,
            );
            break;
          case "max_length":
            setResponseValueAndErrors(
              res,
              "maxItems",
              checkDef.maximum,
              message,
              refs,
            );
            break;
          case "length_equals":
            // Handle exact length constraint
            const length = checkDef.length;
            if (length !== undefined) {
              setResponseValueAndErrors(res, "minItems", length, message, refs);
              setResponseValueAndErrors(res, "maxItems", length, message, refs);
            }
            break;
        }
      }
    }
  }

  // Handle old Zod V3 structure for backward compatibility
  if (def.minLength) {
    setResponseValueAndErrors(
      res,
      "minItems",
      def.minLength.value,
      def.minLength.message,
      refs,
    );
  }
  if (def.maxLength) {
    setResponseValueAndErrors(
      res,
      "maxItems",
      def.maxLength.value,
      def.maxLength.message,
      refs,
    );
  }
  if (def.exactLength) {
    setResponseValueAndErrors(
      res,
      "minItems",
      def.exactLength.value,
      def.exactLength.message,
      refs,
    );
    setResponseValueAndErrors(
      res,
      "maxItems",
      def.exactLength.value,
      def.exactLength.message,
      refs,
    );
  }
  return res;
}
