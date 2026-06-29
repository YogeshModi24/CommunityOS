export class ApplicationError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly retryable: boolean;
  public readonly details?: any;

  constructor(message: string, status: number, code: string, retryable = false, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.retryable = retryable;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (
          targetObject: object,
          constructorOpt?: abstract new (...args: never[]) => unknown
        ) => void;
      }
    ).captureStackTrace;

    captureStackTrace?.(this, this.constructor as abstract new (...args: never[]) => unknown);
  }

  public toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        retryable: this.retryable,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}
