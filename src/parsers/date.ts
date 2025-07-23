import { ZodDateDef } from "zod";
import { Refs } from "../Refs.js";
import { ErrorMessages, setResponseValueAndErrors } from "../errorMessages.js";
import { JsonSchema7NumberType } from "./number.js";
import { DateStrategy } from "../Options.js";

export type JsonSchema7DateType =
  | {
      type: "integer" | "string";
      format: "unix-time" | "date-time" | "date";
      minimum?: number;
      maximum?: number;
      errorMessage?: ErrorMessages<JsonSchema7NumberType>;
    }
  | {
      anyOf: JsonSchema7DateType[];
    };

export function parseDateDef(
  def: any, // Changed from ZodDateDef to any for Zod V4 compatibility
  refs: Refs,
  overrideDateStrategy?: DateStrategy,
): JsonSchema7DateType {
  const strategy = overrideDateStrategy ?? refs.dateStrategy;

  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item)),
    };
  }

  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time",
      };
    case "format:date":
      return {
        type: "string",
        format: "date",
      };
    case "integer":
      return integerDateParser(def, refs);
  }
}

const integerDateParser = (def: any, refs: Refs) => { // Changed from ZodDateDef to any for Zod V4 compatibility
  const res: JsonSchema7DateType = {
    type: "integer",
    format: "unix-time",
  };

  if (refs.target === "openApi3") {
    return res;
  }

  // Handle Zod V4 checks structure
  if (def.checks) {
    for (const check of def.checks) {
      // Handle Zod V4 structure with _zod.def
      const checkDef = check._zod?.def;
      if (checkDef) {
        // Get error message from error function if available
        let message = checkDef.message;
        if (!message && checkDef.error && typeof checkDef.error === 'function') {
          try {
            message = checkDef.error();
          } catch (e) {
            // Ignore error, use undefined message
          }
        }

        switch (checkDef.check) {
          case "greater_than":
            // Convert Date to milliseconds for JSON Schema
            const minValue = checkDef.value instanceof Date ? checkDef.value.getTime() : checkDef.value;
            setResponseValueAndErrors(
              res,
              "minimum",
              minValue,
              message,
              refs,
            );
            break;
          case "less_than":
            // Convert Date to milliseconds for JSON Schema
            const maxValue = checkDef.value instanceof Date ? checkDef.value.getTime() : checkDef.value;
            setResponseValueAndErrors(
              res,
              "maximum",
              maxValue,
              message,
              refs,
            );
            break;
        }
      } else {
        // Fallback to old Zod V3 structure for backward compatibility
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(
              res,
              "minimum",
              check.value, // This is in milliseconds
              check.message,
              refs,
            );
            break;
          case "max":
            setResponseValueAndErrors(
              res,
              "maximum",
              check.value, // This is in milliseconds
              check.message,
              refs,
            );
            break;
        }
      }
    }
  }

  return res;
};
