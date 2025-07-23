import { ZodStringDef } from "../zodV3V4Compat.js";
import { ErrorMessages, setResponseValueAndErrors } from "../errorMessages.js";
import { Refs } from "../Refs.js";

let emojiRegex: RegExp | undefined = undefined;

/**
 * Generated from the regular expressions found here as of 2024-05-22:
 * https://github.com/colinhacks/zod/blob/master/src/types.ts.
 *
 * Expressions with /i flag have been changed accordingly.
 */
export const zodPatterns = {
  /**
   * `c` was changed to `[cC]` to replicate /i flag
   */
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  /**
   * `a-z` was added to replicate /i flag
   */
  email:
    /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  /**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */
  emoji: () => {
    if (emojiRegex === undefined) {
      emojiRegex = RegExp(
        "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        "u",
      );
    }
    return emojiRegex;
  },
  /**
   * Unused
   */
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  /**
   * Unused
   */
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ipv4Cidr:
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  /**
   * Unused
   */
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
  ipv6Cidr:
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  base64url:
    /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
} as const;

export type JsonSchema7StringType = {
  type: "string";
  minLength?: number;
  maxLength?: number;
  format?:
    | "email"
    | "idn-email"
    | "uri"
    | "uuid"
    | "date-time"
    | "ipv4"
    | "ipv6"
    | "date"
    | "time"
    | "duration";
  pattern?: string;
  allOf?: {
    pattern: string;
    errorMessage?: ErrorMessages<{ pattern: string }>;
  }[];
  anyOf?: {
    format: string;
    errorMessage?: ErrorMessages<{ format: string }>;
  }[];
  errorMessage?: ErrorMessages<JsonSchema7StringType>;
  contentEncoding?: string;
};

export function parseStringDef(
  def: ZodStringDef,
  refs: Refs,
): JsonSchema7StringType {
  const res: JsonSchema7StringType = {
    type: "string",
  };

  if (def.checks) {
    for (const check of def.checks) {
      // Handle Zod V4 structure with _zod.def
      const checkDef = check._zod?.def;
      if (checkDef) {
        switch (checkDef.check) {
          case "min_length":
            // Extract error message for min_length check
            let minLengthMessage = checkDef.message;
            if (
              !minLengthMessage &&
              checkDef.error &&
              typeof checkDef.error === "function"
            ) {
              try {
                minLengthMessage = checkDef.error();
              } catch (e) {
                // Ignore error, use undefined message
              }
            }
            setResponseValueAndErrors(
              res,
              "minLength",
              typeof res.minLength === "number"
                ? Math.max(res.minLength, checkDef.minimum)
                : checkDef.minimum,
              minLengthMessage,
              refs,
            );
            break;
          case "max_length":
            // Extract error message for max_length check
            let maxLengthMessage = checkDef.message;
            if (
              !maxLengthMessage &&
              checkDef.error &&
              typeof checkDef.error === "function"
            ) {
              try {
                maxLengthMessage = checkDef.error();
              } catch (e) {
                // Ignore error, use undefined message
              }
            }
            setResponseValueAndErrors(
              res,
              "maxLength",
              typeof res.maxLength === "number"
                ? Math.min(res.maxLength, checkDef.maximum)
                : checkDef.maximum,
              maxLengthMessage,
              refs,
            );
            break;
          case "length_equals":
            // Handle exact length constraint
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

            // For length_equals, the length is stored in checkDef.length
            const length = checkDef.length;
            if (length !== undefined) {
              // Apply length constraint, but respect existing min/max constraints
              setResponseValueAndErrors(
                res,
                "minLength",
                typeof res.minLength === "number"
                  ? Math.max(res.minLength, length)
                  : length,
                message,
                refs,
              );
              setResponseValueAndErrors(
                res,
                "maxLength",
                typeof res.maxLength === "number"
                  ? Math.min(res.maxLength, length)
                  : length,
                message,
                refs,
              );
            }
            break;
          case "string_format":
            // Extract error message for string format checks
            let formatMessage = checkDef.message;
            if (
              !formatMessage &&
              checkDef.error &&
              typeof checkDef.error === "function"
            ) {
              try {
                formatMessage = checkDef.error();
              } catch (e) {
                // Ignore error, use undefined message
              }
            }

            const format = checkDef.format;
            if (format === "email") {
              switch (refs.emailStrategy) {
                case "format:email":
                  addFormat(res, "email", formatMessage, refs);
                  break;
                case "format:idn-email":
                  addFormat(res, "idn-email", formatMessage, refs);
                  break;
                case "pattern:zod":
                  addPattern(res, zodPatterns.email, formatMessage, refs);
                  break;
              }
            } else if (format === "uri") {
              addFormat(res, "uri", formatMessage, refs);
            } else if (format === "url") {
              addFormat(res, "uri", formatMessage, refs);
            } else if (format === "uuid") {
              addFormat(res, "uuid", formatMessage, refs);
            } else if (format === "date-time") {
              addFormat(res, "date-time", formatMessage, refs);
            } else if (format === "date") {
              addFormat(res, "date", formatMessage, refs);
            } else if (format === "time") {
              addFormat(res, "time", formatMessage, refs);
            } else if (format === "duration") {
              addFormat(res, "duration", formatMessage, refs);
            } else if (format === "datetime") {
              addFormat(res, "date-time", formatMessage, refs);
            } else if (format === "ipv4") {
              addFormat(res, "ipv4", formatMessage, refs);
            } else if (format === "ipv6") {
              addFormat(res, "ipv6", formatMessage, refs);
            } else if (format === "ulid") {
              // Use the library's ULID pattern for consistency
              addPattern(res, zodPatterns.ulid, formatMessage, refs);
            } else if (format === "nanoid") {
              // Use the library's nanoid pattern for consistency
              addPattern(res, zodPatterns.nanoid, formatMessage, refs);
            } else if (format === "cuid") {
              // Use the library's CUID pattern for consistency
              addPattern(res, zodPatterns.cuid, formatMessage, refs);
            } else if (format === "cuid2") {
              // Use the library's CUID2 pattern for consistency
              addPattern(res, zodPatterns.cuid2, formatMessage, refs);
            } else if (format === "base64") {
              // Handle base64 format with strategy
              switch (refs.base64Strategy) {
                case "format:binary":
                  addFormat(res, "binary" as any, formatMessage, refs);
                  break;
                case "contentEncoding:base64":
                default:
                  // Default strategy is contentEncoding
                  if (formatMessage && refs.errorMessages) {
                    res.errorMessage = {
                      ...res.errorMessage,
                      contentEncoding: formatMessage,
                    };
                  }
                  res.contentEncoding = "base64";
                  break;
                case "pattern:zod":
                  // Use the library's base64 pattern for consistency
                  addPattern(res, zodPatterns.base64, formatMessage, refs);
                  break;
              }
            } else if (format === "regex" && checkDef.pattern) {
              // Handle Zod V4 regex format
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
              addPattern(res, checkDef.pattern, message, refs);
            } else if (checkDef.pattern) {
              // Handle formats with patterns (cuid, cuid2, nanoid, ulid, startsWith, endsWith, includes, etc.)
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

              // Handle patternStrategy: "preserve" for startsWith, endsWith, includes
              if (refs.patternStrategy === "preserve") {
                let preservedPattern: string | undefined;

                if (checkDef.prefix !== undefined) {
                  // startsWith case
                  preservedPattern = `^${checkDef.prefix}`;
                } else if (checkDef.suffix !== undefined) {
                  // endsWith case
                  preservedPattern = `${checkDef.suffix}$`;
                } else if (checkDef.includes !== undefined) {
                  // includes case
                  preservedPattern = checkDef.includes;
                }

                if (preservedPattern !== undefined) {
                  addPattern(res, new RegExp(preservedPattern), message, refs);
                  break;
                }
              }

              // Normalize Zod V4 patterns to match Zod V3 behavior
              let normalizedPattern = checkDef.pattern;
              const patternSource = checkDef.pattern.source;

              // For startsWith: remove trailing .*
              if (
                patternSource.startsWith("^") &&
                patternSource.endsWith(".*")
              ) {
                normalizedPattern = new RegExp(
                  patternSource.slice(0, -2),
                  checkDef.pattern.flags,
                );
              }
              // For endsWith: remove leading .*
              else if (
                patternSource.startsWith(".*") &&
                patternSource.endsWith("$")
              ) {
                normalizedPattern = new RegExp(
                  patternSource.slice(2),
                  checkDef.pattern.flags,
                );
              }

              addPattern(res, normalizedPattern, message, refs);
            }
            break;
        }
        continue;
      }

      // Handle old Zod V3 structure for backward compatibility
      if (check.kind) {
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(
              res,
              "minLength",
              typeof res.minLength === "number"
                ? Math.max(res.minLength, check.value)
                : check.value,
              check.message,
              refs,
            );
            break;
          case "max":
            setResponseValueAndErrors(
              res,
              "maxLength",
              typeof res.maxLength === "number"
                ? Math.min(res.maxLength, check.value)
                : check.value,
              check.message,
              refs,
            );

            break;
          case "email":
            switch (refs.emailStrategy) {
              case "format:email":
                addFormat(res, "email", check.message, refs);
                break;
              case "format:idn-email":
                addFormat(res, "idn-email", check.message, refs);
                break;
              case "pattern:zod":
                addPattern(res, zodPatterns.email, check.message, refs);
                break;
            }

            break;
          case "url":
            addFormat(res, "uri", check.message, refs);
            break;
          case "uuid":
            addFormat(res, "uuid", check.message, refs);
            break;
          case "regex":
            addPattern(res, check.regex, check.message, refs);
            break;

          case "cuid":
            addPattern(res, zodPatterns.cuid, check.message, refs);
            break;
          case "cuid2":
            addPattern(res, zodPatterns.cuid2, check.message, refs);
            break;
          case "startsWith":
            addPattern(
              res,
              RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`),
              check.message,
              refs,
            );
            break;
          case "endsWith":
            addPattern(
              res,
              RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`),
              check.message,
              refs,
            );
            break;
          case "datetime":
            addFormat(res, "date-time", check.message, refs);
            break;
          case "date":
            addFormat(res, "date", check.message, refs);
            break;
          case "time":
            addFormat(res, "time", check.message, refs);
            break;
          case "duration":
            addFormat(res, "duration", check.message, refs);
            break;
          case "length":
            setResponseValueAndErrors(
              res,
              "minLength",
              typeof res.minLength === "number"
                ? Math.max(res.minLength, check.value)
                : check.value,
              check.message,
              refs,
            );
            setResponseValueAndErrors(
              res,
              "maxLength",
              typeof res.maxLength === "number"
                ? Math.min(res.maxLength, check.value)
                : check.value,
              check.message,
              refs,
            );
            break;
          case "includes": {
            addPattern(
              res,
              RegExp(escapeLiteralCheckValue(check.value, refs)),
              check.message,
              refs,
            );
            break;
          }
          case "ip": {
            if (check.version !== "v6") {
              addFormat(res, "ipv4", check.message, refs);
            }
            if (check.version !== "v4") {
              addFormat(res, "ipv6", check.message, refs);
            }
            break;
          }
          case "base64url":
            addPattern(res, zodPatterns.base64url, check.message, refs);
            break;
          case "jwt":
            addPattern(res, zodPatterns.jwt, check.message, refs);
            break;
          case "cidr": {
            if (check.version !== "v6") {
              addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
            }
            if (check.version !== "v4") {
              addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
            }
            break;
          }
          case "emoji":
            addPattern(res, zodPatterns.emoji(), check.message, refs);
            break;
          case "ulid": {
            addPattern(res, zodPatterns.ulid, check.message, refs);
            break;
          }
          case "base64": {
            switch (refs.base64Strategy) {
              case "format:binary": {
                addFormat(res, "binary" as any, check.message, refs);
                break;
              }

              case "contentEncoding:base64": {
                setResponseValueAndErrors(
                  res,
                  "contentEncoding",
                  "base64",
                  check.message,
                  refs,
                );
                break;
              }

              case "pattern:zod": {
                addPattern(res, zodPatterns.base64, check.message, refs);
                break;
              }
            }
            break;
          }
          case "nanoid": {
            addPattern(res, zodPatterns.nanoid, check.message, refs);
          }
          case "toLowerCase":
          case "toUpperCase":
          case "trim":
            break;
          default:
            /* c8 ignore next */
            // Handle unknown check types in V3/V4 compatibility
            break;
        }
      }
    }
  }

  return res;
}

function escapeLiteralCheckValue(literal: string, refs: Refs): string {
  return refs.patternStrategy === "escape"
    ? escapeNonAlphaNumeric(literal)
    : literal;
}

const ALPHA_NUMERIC = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789",
);

function escapeNonAlphaNumeric(source: string) {
  let result = "";

  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC.has(source[i])) {
      result += "\\";
    }

    result += source[i];
  }

  return result;
}

// Adds a "format" keyword to the schema. If a format exists, both formats will be joined in an allOf-node, along with subsequent ones.
function addFormat(
  schema: JsonSchema7StringType,
  value: Required<JsonSchema7StringType>["format"],
  message: string | undefined,
  refs: Refs,
) {
  if (schema.format || schema.anyOf?.some((x) => x.format)) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }

    if (schema.format) {
      schema.anyOf!.push({
        format: schema.format,
        ...(schema.errorMessage &&
          refs.errorMessages && {
            errorMessage: { format: schema.errorMessage.format },
          }),
      });
      delete schema.format;
      if (schema.errorMessage) {
        delete schema.errorMessage.format;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }

    schema.anyOf!.push({
      format: value,
      ...(message &&
        refs.errorMessages && { errorMessage: { format: message } }),
    });
  } else {
    setResponseValueAndErrors(schema, "format", value, message, refs);
  }
}

// Adds a "pattern" keyword to the schema. If a pattern exists, both patterns will be joined in an allOf-node, along with subsequent ones.
function addPattern(
  schema: JsonSchema7StringType,
  regex: RegExp,
  message: string | undefined,
  refs: Refs,
) {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }

    if (schema.pattern) {
      schema.allOf!.push({
        pattern: schema.pattern,
        ...(schema.errorMessage &&
          refs.errorMessages && {
            errorMessage: { pattern: schema.errorMessage.pattern },
          }),
      });
      delete schema.pattern;
      if (schema.errorMessage) {
        delete schema.errorMessage.pattern;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }

    schema.allOf!.push({
      pattern: stringifyRegExpWithFlags(regex, refs),
      ...(message &&
        refs.errorMessages && { errorMessage: { pattern: message } }),
    });
  } else {
    setResponseValueAndErrors(
      schema,
      "pattern",
      stringifyRegExpWithFlags(regex, refs),
      message,
      refs,
    );
  }
}

// Mutate z.string.regex() in a best attempt to accommodate for regex flags when applyRegexFlags is true
function stringifyRegExpWithFlags(regex: RegExp, refs: Refs): string {
  if (!refs.applyRegexFlags || !regex.flags) {
    return regex.source;
  }

  // Currently handled flags
  const flags = {
    i: regex.flags.includes("i"), // Case-insensitive
    m: regex.flags.includes("m"), // `^` and `$` matches adjacent to newline characters
    s: regex.flags.includes("s"), // `.` matches newlines
  };

  // The general principle here is to step through each character, one at a time, applying mutations as flags require. We keep track when the current character is escaped, and when it's inside a group /like [this]/ or (also) a range like /[a-z]/. The following is fairly brittle imperative code; edit at your peril!
  const source = flags.i ? regex.source.toLowerCase() : regex.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;

  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }

    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }

    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r\n]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r\n]))`;
        continue;
      }
    }

    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r\n` : `[${source[i]}\r\n]`;
      continue;
    }

    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }

  try {
    new RegExp(pattern);
  } catch {
    console.warn(
      `Could not convert regex pattern at ${refs.currentPath.join(
        "/",
      )} to a flag-independent form! Falling back to the flag-ignorant source`,
    );
    return regex.source;
  }

  return pattern;
}
