"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSetDef = parseSetDef;
const errorMessages_js_1 = require("../errorMessages.js");
const parseDef_js_1 = require("../parseDef.js");
function parseSetDef(def, refs) {
    // In Zod V4, use valueType.def instead of valueType._def
    const valueTypeDef = def.valueType?.def || def.valueType?._def;
    const items = (0, parseDef_js_1.parseDef)(valueTypeDef, {
        ...refs,
        currentPath: [...refs.currentPath, "items"],
    });
    const schema = {
        type: "array",
        uniqueItems: true,
        items,
    };
    // Handle Zod V4 checks array
    if (def.checks) {
        for (const check of def.checks) {
            const checkDef = check._zod?.def;
            if (checkDef) {
                // Get error message from error function if available
                let message = checkDef.message;
                if (!message && checkDef.error && typeof checkDef.error === 'function') {
                    try {
                        message = checkDef.error();
                    }
                    catch (e) {
                        // Ignore error, use undefined message
                    }
                }
                switch (checkDef.check) {
                    case "min_size":
                        (0, errorMessages_js_1.setResponseValueAndErrors)(schema, "minItems", checkDef.minimum, message, refs);
                        break;
                    case "max_size":
                        (0, errorMessages_js_1.setResponseValueAndErrors)(schema, "maxItems", checkDef.maximum, message, refs);
                        break;
                }
            }
        }
    }
    // Handle old Zod V3 structure for backward compatibility
    if (def.minSize) {
        (0, errorMessages_js_1.setResponseValueAndErrors)(schema, "minItems", def.minSize.value, def.minSize.message, refs);
    }
    if (def.maxSize) {
        (0, errorMessages_js_1.setResponseValueAndErrors)(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
    }
    return schema;
}
