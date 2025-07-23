"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePipelineDef = void 0;
const parseDef_js_1 = require("../parseDef.js");
const parsePipelineDef = (def, // Changed from ZodPipelineDef to any for Zod V4 compatibility
refs) => {
    // In Zod V4, use .def instead of ._def for inner types
    const inDef = def.in?.def || def.in?._def;
    const outDef = def.out?.def || def.out?._def;
    // Check if this is a transform/preprocess operation (effect-like)
    // In Zod V4, transforms have one side with type "transform"
    const isTransformLike = (inDef?.type === "transform") ||
        (outDef?.type === "transform");
    // For transform-like operations, use effectStrategy instead of pipeStrategy
    if (isTransformLike) {
        if (refs.effectStrategy === "input") {
            // For preprocess: in=transform, out=target -> use out (target)
            // For transform: in=source, out=transform -> use in (source)
            return inDef?.type === "transform"
                ? (0, parseDef_js_1.parseDef)(outDef, refs) // preprocess case
                : (0, parseDef_js_1.parseDef)(inDef, refs); // transform case
        }
        else {
            // effectStrategy === "any"
            return {}; // Return empty schema for "any" strategy
        }
    }
    // Regular pipe handling
    if (refs.pipeStrategy === "input") {
        return (0, parseDef_js_1.parseDef)(inDef, refs);
    }
    else if (refs.pipeStrategy === "output") {
        return (0, parseDef_js_1.parseDef)(outDef, refs);
    }
    const a = (0, parseDef_js_1.parseDef)(inDef, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "0"],
    });
    const b = (0, parseDef_js_1.parseDef)(outDef, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"],
    });
    return {
        allOf: [a, b].filter((x) => x !== undefined),
    };
};
exports.parsePipelineDef = parsePipelineDef;
