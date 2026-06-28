export declare class Result<T, E = string> {
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
    private readonly _value?;
    private readonly _error?;
    private constructor();
    get value(): T;
    get error(): E;
    static ok<U, F = string>(value?: U): Result<U, F>;
    static fail<U, F = string>(error: F): Result<U, F>;
}
//# sourceMappingURL=Result.d.ts.map