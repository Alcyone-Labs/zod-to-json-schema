"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUndefinedDef = parseUndefinedDef;
const any_js_1 = require("./any.js");
function parseUndefinedDef(refs) {
    return {
        not: (0, any_js_1.parseAnyDef)(refs),
    };
}
