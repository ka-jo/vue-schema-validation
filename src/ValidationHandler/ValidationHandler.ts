import { Ref } from "vue";

import { Schema } from "@/Schema";
import { ValidationOptions } from "@/Types/ValidationOptions";
import { Validation } from "@/Types/Validation";
import {
    ArrayValidationHandler,
    ObjectValidationHandler,
    PrimitiveValidationHandler,
} from "@/ValidationHandler";

/**
 * Base class for managing validation state for a value
 * @typeParam T - Type of the value being validated. This is not the type of the schema itself, but the type the schema is validating
 * @remarks
 * For the most part, the type parameter T is only used to determine if fields should be present on the handler.
 * Once the specific ValidationHandler implementation is created, it's much simpler for it to treat the value as a black box.
 * @internal
 */
export abstract class ValidationHandler<T = unknown> {
    /**
     * {@link Schema} to use for validation
     * @remarks
     * The validation handler should not be concerned with interacting with library specific schemas (i.e. Yup schemas) directly.
     * Instead, it should interact with the schema through the {@link Schema} class to abstract away library specific interactions.
     */
    protected readonly schema: Schema;

    /**
     * Options for validation
     * @remarks
     * The schema property of the options will be a library specific schema (i.e. Yup schema) and should not be interacted with directly.
     * For this reason, the schema property is omitted from typing of options here, even though it may appear on the options object at runtime.
     */
    protected readonly options: ValidationHandlerOptions<T>;

    /**
     * Ref to the value being validated
     * @remarks
     * Treating this as a ref enables us to expose the value in multiple ways
     * (i.e. via the value property on a validation object itself,
     * or via the corresponding property of the value of a parent validation object)
     */
    abstract readonly value: Ref<T>;

    /**
     * Ref for errors encountered during validation
     * @remarks
     * This is iterable to allow us to gather all errors at once, but it's not an array.
     * For object schemas, this will be an object with the same keys as the schema where each value is a ref of an iterable of error messages.
     * For array schemas, this will an object with numeric keys where each value is a ref of an iterable of error messages.
     *
     * Treating this as a ref enables us to expose the errors in multiple ways (i.e. via the errors property on a validation object itself
     * or via the corresposnding property of the errors of a parent validation object)
     */
    abstract readonly errors: Ref<Iterable<string>>;

    /**
     * Ref that tracks if the value was valid after the last call to validate
     * @remarks
     * This is only updated after a call to validate. Changing the {@link ValidationHandler.value ValidationHanlder's value} will not automatically update isValid
     */
    abstract readonly isValid: Ref<boolean>;

    /**
     * Object containing the validation handlers for each field of the schema
     * @remarks
     * For object schemas, this will be an object with the same keys as the schema where each value is a {@link ValidationHandler}.
     * For array schemas, this will be an object with numeric keys where each value is a {@link ValidationHandler}.
     * For other schema types, this will be undefined
     */
    abstract readonly fields: ValidationHandlerFields<T>;

    /**
     * Runs validations on current value and update errors and isValid accordingly
     * @returns true if the value is valid, false otherwise
     * @remarks
     * This will recursively call validate on all child fields to validate their values and update their errors and isValid as well.
     */
    abstract validate(): boolean;

    /**
     * Clears all errors and sets isValid to false
     * @remarks
     * This will recursively call reset on all child fields to clear their errors and set their isValid to false as well.
     * If a value is provided, it will be set as the new value for the handler.
     * If no value is provided, the initial value from the provided {@link ValidationOptions} will be used.
     * If no value is provided and the options did not provide an initial value, the schema's default value will be used.
     *
     * @param value - Optional value to set the {@link ValidationHandler.value} to
     */
    abstract reset(value?: T): void;

    /**
     * Converts the ValidationHandler to a reactive object
     * @remarks
     * This is the end product of the initialization process and what is intended to be used by the consumer.
     */
    abstract toReactive(): Validation<T>;

    constructor(schema: Schema, options: ValidationHandlerOptions<T>) {
        this.schema = schema;
        this.options = options;
        // Binding to instance so that 'this' is not Vue proxy
        this.validate = this.validate.bind(this);
        this.reset = this.reset.bind(this);
    }

    public static create(schema: Schema, options: ValidationOptions<unknown>): ValidationHandler {
        switch (schema.type) {
            case "array":
                return ArrayValidationHandler.create(schema, options);
            case "object":
                return ObjectValidationHandler.create(schema, options);
            case "primitive":
            case "unknown":
            default:
                return PrimitiveValidationHandler.create(schema, options);
        }
    }
}

/**
 * Type for the fields of a ValidationHandler. If generic type is an object, this will be an object with the same keys as the generic type
 * For non-object types, this will be undefined
 * @internal
 */
export type ValidationHandlerFields<T> = T extends unknown
    ? unknown
    : T extends Array<any>
    ? Record<number, ValidationHandler>
    : T extends object
    ? Record<string, ValidationHandler>
    : undefined;

/**
 * Type for the options passed to a ValidationHandler. This is the same as {@link ValidationOptions} but without the schema property.
 * This is to ensure the ValidationHandler does not interact with library specific schemas directly.
 * @internal
 */
export type ValidationHandlerOptions<T = unknown> = Omit<ValidationOptions<T>, "schema">;
