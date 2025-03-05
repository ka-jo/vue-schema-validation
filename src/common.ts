import { Ref } from "vue";
import { ReadonlyRef } from "./Types/util";

export const HandlerInstance: unique symbol = Symbol("HandlerInstance");

/**
 * This function is meant to be used as the iterator for error objects of ObjectValidationHandler and ArrayValidationHandler
 * @param this - The error object itself
 * @remarks
 * This function should be bound to the error object and added to the error object as [Symbol.iterator]
 * using the {@link makeIterableErrorObject} function
 */
export function* iterableFieldIterator(this: Record<PropertyKey, ReadonlyRef<Iterable<string>>>) {
    for (const field of Object.keys(this)) {
        for (const value of this[field].value) {
            yield value;
        }
    }
}

/**
 * This function implements the iterator protocol on error objects for ObjectValidationHandler and ArrayValidationHandler
 * @param errors
 * @returns the errors object with the Symbol.iterator property added
 */
export function makeIterableErrorObject(
    errors: Record<PropertyKey, ReadonlyRef<Iterable<string>>>,
    rootErrors: Ref<ReadonlyArray<string>>
): ErrorObject {
    //@ts-ignore: I don't like needing to do TypeScript tricks like this, but the type coming in should not already have Symbol.iterator
    errors[Symbol.iterator] = iterableFieldIterator.bind(errors);
    //@ts-ignore: ¯\_(ツ)_/¯
    errors.$root = rootErrors;
    return errors as ErrorObject;
}

/**
 * @internal
 */
export type ErrorObject = Record<PropertyKey, ReadonlyRef<Iterable<string>>> &
    Iterable<string> & { $root: Ref<ReadonlyArray<string>> };
