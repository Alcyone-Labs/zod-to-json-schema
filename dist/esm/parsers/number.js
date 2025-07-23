import { addErrorMessage, setResponseValueAndErrors, } from "../errorMessages.js";
export function parseNumberDef(def, // Changed from ZodNumberDef to any for Zod V4 compatibility
refs) {
    const res = {
        type: "number",
    };
    if (!def.checks)
        return res;
    for (const check of def.checks) {
        // Handle Zod V4 structure with _zod.def
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
                case "number_format":
                    if (checkDef.format === "safeint") {
                        res.type = "integer";
                        addErrorMessage(res, "type", message, refs);
                    }
                    break;
                case "greater_than":
                    if (refs.target === "jsonSchema7") {
                        if (checkDef.inclusive) {
                            setResponseValueAndErrors(res, "minimum", checkDef.value, message, refs);
                        }
                        else {
                            setResponseValueAndErrors(res, "exclusiveMinimum", checkDef.value, message, refs);
                        }
                    }
                    else {
                        if (!checkDef.inclusive) {
                            res.exclusiveMinimum = true;
                        }
                        setResponseValueAndErrors(res, "minimum", checkDef.value, message, refs);
                    }
                    break;
                case "less_than":
                    if (refs.target === "jsonSchema7") {
                        if (checkDef.inclusive) {
                            setResponseValueAndErrors(res, "maximum", checkDef.value, message, refs);
                        }
                        else {
                            setResponseValueAndErrors(res, "exclusiveMaximum", checkDef.value, message, refs);
                        }
                    }
                    else {
                        if (!checkDef.inclusive) {
                            res.exclusiveMaximum = true;
                        }
                        setResponseValueAndErrors(res, "maximum", checkDef.value, message, refs);
                    }
                    break;
                case "multiple_of":
                    setResponseValueAndErrors(res, "multipleOf", checkDef.value, message, refs);
                    break;
            }
        }
        else {
            // Fallback to old Zod V3 structure for backward compatibility
            switch (check.kind) {
                case "int":
                    res.type = "integer";
                    addErrorMessage(res, "type", check.message, refs);
                    break;
                case "min":
                    if (refs.target === "jsonSchema7") {
                        if (check.inclusive) {
                            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
                        }
                        else {
                            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
                        }
                    }
                    else {
                        if (!check.inclusive) {
                            res.exclusiveMinimum = true;
                        }
                        setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
                    }
                    break;
                case "max":
                    if (refs.target === "jsonSchema7") {
                        if (check.inclusive) {
                            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
                        }
                        else {
                            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
                        }
                    }
                    else {
                        if (!check.inclusive) {
                            res.exclusiveMaximum = true;
                        }
                        setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
                    }
                    break;
                case "multipleOf":
                    setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
                    break;
            }
        }
    }
    return res;
}
