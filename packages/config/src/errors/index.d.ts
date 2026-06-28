export interface ValidationErrorDetail {
    key: string;
    expected: string;
    received: string;
    message: string;
}
export declare class ConfigurationValidationError extends Error {
    readonly details: ValidationErrorDetail[];
    constructor(details: ValidationErrorDetail[], context: 'Server' | 'Client');
    private static formatErrorMessage;
}
//# sourceMappingURL=index.d.ts.map