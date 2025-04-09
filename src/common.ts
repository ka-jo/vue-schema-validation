import { Ref } from "vue";

import { ReadonlyRef } from "@/Types/util";
import { SchemaValidation } from "@/Types/SchemaValidation";

export const Handler: unique symbol = Symbol("Handler");

export const ProxyHooks: unique symbol = Symbol("ProxyHooks");

export const noop = () => {};

export function isSchemaValidation(value: unknown): value is SchemaValidation {
    return Handler in Object(value);
}

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
 * This function implements the iterator protocol on error objects for ObjectValidationHandler, ArrayValidationHandler, and TupleValidationHandler.
 * It also adds a $root property to the error object containing the root errors for the validation handler.
 * @param errors - The error object to add the iterator to
 * @param rootErrors - The root errors ref to add to the error object
 * @returns the errors object with the Symbol.iterator property added
 */
export function makeIterableErrorObject(
    errors: Record<PropertyKey, ReadonlyRef<Iterable<string>>>,
    rootErrors: Ref<ReadonlyArray<string>>
): ErrorObjectWithRoot {
    //@ts-ignore: I don't like needing to do TypeScript tricks like this, but the type coming in should not already have Symbol.iterator
    errors[Symbol.iterator] = iterableFieldIterator.bind(errors);
    //@ts-ignore
    errors.$root = rootErrors;
    return errors as ErrorObjectWithRoot;
}

/**
 * @internal
 */
export type ErrorObject = Record<string | number, ReadonlyRef<Iterable<string>>> & Iterable<string>;

/**
 * @internal
 */
export type ErrorObjectWithRoot = ErrorObject & { $root: Ref<ReadonlyArray<string>> };
