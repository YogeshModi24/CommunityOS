export class Result<T, E = string> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;
  }

  public get value(): T {
    if (this.isFailure) {
      throw new Error(`Cannot retrieve value from a failed result: ${this._error}`);
    }
    return this._value!;
  }

  public get error(): E {
    if (this.isSuccess) {
      throw new Error('Cannot retrieve error from a successful result.');
    }
    return this._error!;
  }

  public static ok<U, F = string>(value?: U): Result<U, F> {
    return new Result<U, F>(true, undefined, value);
  }

  public static fail<U, F = string>(error: F): Result<U, F> {
    return new Result<U, F>(false, error, undefined);
  }
}
