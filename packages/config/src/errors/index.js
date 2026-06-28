"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationValidationError = void 0;
class ConfigurationValidationError extends Error {
    details;
    constructor(details, context) {
        const formattedMessage = ConfigurationValidationError.formatErrorMessage(details, context);
        super(formattedMessage);
        this.name = 'ConfigurationValidationError';
        this.details = details;
    }
    static formatErrorMessage(details, context) {
        const divider = '='.repeat(80);
        const boxTitle = `   [STARTUP ERROR] Invalid ${context} Configuration   `;
        const boxContent = details
            .map((d) => {
            return `* Variable: ${d.key}
  - Issue: ${d.message}
  - Expected: ${d.expected}
  - Received: ${d.received === 'undefined' ? '[Missing]' : '[Invalid Value]'}`;
        })
            .join('\n\n');
        return `\n${divider}\n${boxTitle}\n${divider}\n\nThe following configuration issues were detected at startup:\n\n${boxContent}\n\nPlease check your environment configurations.\n${divider}\n`;
    }
}
exports.ConfigurationValidationError = ConfigurationValidationError;
