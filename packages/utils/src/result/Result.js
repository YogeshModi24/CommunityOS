"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
class Result {
    isSuccess;
    isFailure;
    _value;
    _error;
    constructor(isSuccess, error, value) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this._value = value;
        this._error = error;
    }
    get value() {
        if (this.isFailure) {
            throw new Error(`Cannot retrieve value from a failed result: ${this._error}`);
        }
        return this._value;
    }
    get error() {
        if (this.isSuccess) {
            throw new Error('Cannot retrieve error from a successful result.');
        }
        return this._error;
    }
    static ok(value) {
        return new Result(true, undefined, value);
    }
    static fail(error) {
        return new Result(false, error, undefined);
    }
}
exports.Result = Result;
