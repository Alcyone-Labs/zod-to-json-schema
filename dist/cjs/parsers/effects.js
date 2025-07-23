"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEffectsDef = parseEffectsDef;
const parseDef_js_1 = require("../parseDef.js");
const any_js_1 = require("./any.js");
function parseEffectsDef(_def, // Changed from ZodEffectsDef to any for Zod V4 compatibility
refs) {
    // In Zod V4, effects might be represented differently
    // For transforms, we might have a pipe structure
    if (_def.type === "pipe") {
        // This is a transform (pipe) - handle in pipeline parser
        return refs.effectStrategy === "input"
            ? (0, parseDef_js_1.parseDef)(_def.in?.def || _def.in?._def, refs)
            : (0, any_js_1.parseAnyDef)(refs);
    }
    // For backward compatibility with Zod V3 effects
    if (_def.schema) {
        return refs.effectStrategy === "input"
            ? (0, parseDef_js_1.parseDef)(_def.schema._def || _def.schema.def, refs)
            : (0, any_js_1.parseAnyDef)(refs);
    }
    // If no schema found, return any
    return (0, any_js_1.parseAnyDef)(refs);
}
