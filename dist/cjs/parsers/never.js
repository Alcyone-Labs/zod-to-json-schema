"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNeverDef = parseNeverDef;
const any_js_1 = require("./any.js");
function parseNeverDef(refs) {
    return refs.target === "openAi"
        ? undefined
        : {
            not: (0, any_js_1.parseAnyDef)({
                ...refs,
                currentPath: [...refs.currentPath, "not"],
            }),
        };
}
