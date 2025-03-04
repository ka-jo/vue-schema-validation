import { ReadonlyRef } from "./Types/util";

export const HandlerInstance: unique symbol = Symbol("HandlerInstance");

/**
 * This function is meant to be used as the iterator for error objects of ObjectValidationHandler and ArrayValidationHandler
 * @param this - The error object itself
 * @remarks
 * This function should be bound to the error object and added to the error object as [Symbol.iterator]
 */
export function* iterableFieldIterator(this: Record<PropertyKey, ReadonlyRef<Iterable<string>>>) {
    for (const field of Object.keys(this)) {
        for (const value of this[field].value) {
            yield value;
        }
    }
}

export function makeIterableErrorObject(): Record<PropertyKey, ReadonlyRef<Iterable<string>>> &
    Iterable<string> {
    const errors: any = {};
    errors[Symbol.iterator] = iterableFieldIterator.bind(errors);
    return errors;
}
