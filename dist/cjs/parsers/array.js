"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArrayDef = parseArrayDef;
const errorMessages_js_1 = require("../errorMessages.js");
const parseDef_js_1 = require("../parseDef.js");
function parseArrayDef(def, refs) {
    // Changed from ZodArrayDef to any for Zod V4 compatibility
    const res = {
        type: "array",
    };
    // In Zod V4, use element instead of type, and .def instead of ._def
    const elementType = def.element || def.type;
    const elementDef = elementType?.def || elementType?._def;
    const elementTypeName = elementDef?.type || elementDef?.typeName;
    if (elementDef && elementTypeName !== "any" && elementTypeName !== "ZodAny") {
        res.items = (0, parseDef_js_1.parseDef)(elementDef, {
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
                if (!message &&
                    checkDef.error &&
                    typeof checkDef.error === "function") {
                    try {
                        message = checkDef.error();
                    }
                    catch (e) {
                        // Ignore error, use undefined message
                    }
                }
                switch (checkDef.check) {
                    case "min_length":
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minItems", checkDef.minimum, message, refs);
                        break;
                    case "max_length":
                        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maxItems", checkDef.maximum, message, refs);
                        break;
                    case "length_equals":
                        // Handle exact length constraint
                        const length = checkDef.length;
                        if (length !== undefined) {
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minItems", length, message, refs);
                            (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maxItems", length, message, refs);
                        }
                        break;
                }
            }
        }
    }
    // Handle old Zod V3 structure for backward compatibility
    if (def.minLength) {
        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minItems", def.minLength.value, def.minLength.message, refs);
    }
    if (def.maxLength) {
        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
    }
    if (def.exactLength) {
        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
        (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
    }
    return res;
}
