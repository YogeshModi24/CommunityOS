export interface ValidationErrorDetail {
  key: string;
  expected: string;
  received: string;
  message: string;
}

export class ConfigurationValidationError extends Error {
  public readonly details: ValidationErrorDetail[];

  constructor(details: ValidationErrorDetail[], context: 'Server' | 'Client') {
    const formattedMessage = ConfigurationValidationError.formatErrorMessage(details, context);
    super(formattedMessage);
    this.name = 'ConfigurationValidationError';
    this.details = details;
  }

  private static formatErrorMessage(
    details: ValidationErrorDetail[],
    context: 'Server' | 'Client'
  ): string {
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
