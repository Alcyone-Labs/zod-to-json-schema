"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBigintDef = parseBigintDef;
const errorMessages_js_1 = require("../errorMessages.js");
function parseBigintDef(def, // Changed from ZodBigIntDef to any for Zod V4 compatibility
refs) {
    const res = {
        type: "integer",
        format: "int64",
    };
    if (!def.checks)
        return res;
    for (const check of def.checks) {
        // Handle Zod V4 structure with _zod.def
        const checkDef = check._zod?.def;
        if (checkDef) {
            // Get error message from error function if available
            let message = checkDef.message;
            if (!message && checkDef.error && typeof checkDef.error === "function") {
                try {
                    message = checkDef.error();
                }
                catch (e) {
                    // Ignore error, use undefined message
                }
            }
            switch (checkDef.check) {
                case "greater_than":
                    // Preserve BigInt values as expected by the tests
                    const minValue = checkDef.value;
                    if (refs.target === "jsonSchema7") {
                        if (checkDef.inclusive) {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minimum", minValue, message, refs);
                        }
                        else {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "exclusiveMinimum", minValue, message, refs);
                        }
                    }
                    else {
                        if (!checkDef.inclusive) {
                            res.exclusiveMinimum = true;
                        }
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minimum", minValue, message, refs);
                    }
                    break;
                case "less_than":
                    // Preserve BigInt values as expected by the tests
                    const maxValue = checkDef.value;
                    if (refs.target === "jsonSchema7") {
                        if (checkDef.inclusive) {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maximum", maxValue, message, refs);
                        }
                        else {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "exclusiveMaximum", maxValue, message, refs);
                        }
                    }
                    else {
                        if (!checkDef.inclusive) {
                            res.exclusiveMaximum = true;
                        }
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maximum", maxValue, message, refs);
                    }
                    break;
                case "multiple_of":
                    // Preserve BigInt values as expected by the tests
                    const multipleValue = checkDef.value;
                    (0, errorMessages_js_1.setResponseValueAndErrors)(res, "multipleOf", multipleValue, message, refs);
                    break;
            }
        }
        else {
            // Fallback to old Zod V3 structure for backward compatibility
            switch (check.kind) {
                case "min":
                    if (refs.target === "jsonSchema7") {
                        if (check.inclusive) {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minimum", check.value, check.message, refs);
                        }
                        else {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "exclusiveMinimum", check.value, check.message, refs);
                        }
                    }
                    else {
                        if (!check.inclusive) {
                            res.exclusiveMinimum = true;
                        }
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minimum", check.value, check.message, refs);
                    }
                    break;
                case "max":
                    if (refs.target === "jsonSchema7") {
                        if (check.inclusive) {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maximum", check.value, check.message, refs);
                        }
                        else {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "exclusiveMaximum", check.value, check.message, refs);
                        }
                    }
                    else {
                        if (!check.inclusive) {
                            res.exclusiveMaximum = true;
                        }
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maximum", check.value, check.message, refs);
                    }
                    break;
                case "multipleOf":
                    (0, errorMessages_js_1.setResponseValueAndErrors)(res, "multipleOf", check.value, check.message, refs);
                    break;
            }
        }
    }
    return res;
}
