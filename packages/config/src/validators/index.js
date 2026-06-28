"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServerEnv = validateServerEnv;
exports.validateClientEnv = validateClientEnv;
const errors_1 = require("../errors");
const loader_1 = require("../loader");
const schemas_1 = require("../schemas");
function resolveAndValidate(schema, context, resolver = loader_1.defaultResolver) {
    const rawObj = {};
    for (const key of Object.keys(schema.shape)) {
        rawObj[key] = resolver(key);
    }
    const result = schema.safeParse(rawObj);
    if (!result.success) {
        const details = result.error.issues.map((issue) => {
            const key = String(issue.path[0]);
            // Avoid exposing any potential secrets in error details
            const expected = 'expected' in issue ? String(issue.expected) : 'Valid type';
            const received = 'received' in issue ? String(issue.received) : 'Invalid format';
            return {
                key,
                expected,
                received,
                message: issue.message,
            };
        });
        throw new errors_1.ConfigurationValidationError(details, context);
    }
    // Freeze the configuration object to enforce immutability
    return Object.freeze(result.data);
}
function validateServerEnv(resolver = loader_1.defaultResolver) {
    return resolveAndValidate(schemas_1.ServerSchema, 'Server', resolver);
}
function validateClientEnv(resolver = loader_1.defaultResolver) {
    return resolveAndValidate(schemas_1.ClientSchema, 'Client', resolver);
}
