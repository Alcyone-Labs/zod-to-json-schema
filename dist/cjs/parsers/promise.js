"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePromiseDef = parsePromiseDef;
const parseDef_js_1 = require("../parseDef.js");
function parsePromiseDef(def, // Changed from ZodPromiseDef to any for Zod V4 compatibility
refs) {
    // In Zod V4, use innerType instead of type, and .def instead of ._def
    const innerType = def.innerType || def.type;
    const innerDef = innerType?.def || innerType?._def;
    return (0, parseDef_js_1.parseDef)(innerDef, refs);
}
