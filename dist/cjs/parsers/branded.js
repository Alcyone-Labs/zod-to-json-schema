"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrandedDef = parseBrandedDef;
const parseDef_js_1 = require("../parseDef.js");
function parseBrandedDef(_def, refs) {
    // Changed from ZodBrandedDef to any for Zod V4 compatibility
    // In Zod V4, branded types might not have a separate type property
    // They might just be the underlying type with TypeScript-level branding
    if (_def.type && _def.type._def) {
        // Old Zod V3 structure
        return (0, parseDef_js_1.parseDef)(_def.type._def, refs);
    }
    else {
        // Zod V4 structure - just parse the def directly as it's the underlying type
        return (0, parseDef_js_1.parseDef)(_def, refs);
    }
}
