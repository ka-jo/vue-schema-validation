import { customRef, Ref } from "vue";

import { DerivedSchemaType, Schema, SchemaType } from "@/Schema";
import { ValidationOptions } from "@/Types/ValidationOptions";
import { SchemaValidation } from "@/Types/SchemaValidation";
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
     * Notifies Vue's reactivity system that the value has been accessed
     */
    protected _trackValue!: () => void;

    /**
     * Notifies Vue's reactivity system that the value has been updated
     */
    protected _triggerValue!: () => void;

    /**
     * Gets the value being validated
     * @remarks
     * This is used to populate the {@link ValidationHandler.value value ref} and should call {@link ValidationHandler._trackValue _trackValue }
     * to notify Vue's reactivity system that the value has been accessed.
     * @returns The value being validated
     */
    protected abstract getValue(): T;

    /**
     * Sets the value being validated
     * @remarks
     * This is used to update the {@link ValidationHandler.value value ref} and should call {@link ValidationHandler._triggerValue _triggerValue}
     * to notify Vue's reactivity system that the value has been updated.
     * @param value - The new value to set
     */
    protected abstract setValue(value: T): void;

    /**
     * Ref to the value being validated
     * @remarks
     * Treating this as a ref enables us to expose the value in multiple ways (i.e. via the value property on a validation object itself,
     * or via the corresponding property of the value of a parent validation object).
     *
     * This is a computed ref created by the ValidationHandler super class and uses the {@link ValidationHandler.getValue getValue} and
     * {@link ValidationHandler.setValue setValue} methods implemented by the subclass.
     */
    readonly value: Ref<T>;

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
     * Ref that tracks if the value has been changed since initialization or the last call to reset
     */
    abstract readonly isDirty: Ref<boolean>;

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
    abstract toReactive(): SchemaValidation<T>;

    constructor(schema: Schema, options: ValidationHandlerOptions<T>) {
        this.schema = schema;
        this.options = options;
        this.value = this.initializeValue();
    }

    private initializeValue(): Ref<T> {
        return customRef((track, trigger) => {
            this._trackValue = track;
            this._triggerValue = trigger;
            return {
                get: this.getValue.bind(this),
                set: this.setValue.bind(this),
            };
        });
    }

    public static create(schema: Schema, options: ValidationHandlerOptions): ValidationHandler {
        switch (schema.type) {
            case "array":
                return ArrayValidationHandler.create(schema as Schema<"array">, options);
            case "object":
                return ObjectValidationHandler.create(schema as Schema<"object">, options);
            case "primitive":
            case "unknown":
            default:
                return PrimitiveValidationHandler.create(schema, options);
        }
    }
}

/**
 * Type for the fields of a ValidationHandler. If generic type is an object or an array, this will be a record of {@link SchemaValidation} objects.
 * For non-object types, this will be undefined
 * @internal
 */
export type ValidationHandlerFields<T> = T extends unknown
    ? unknown
    : T extends Array<any>
    ? Record<number, SchemaValidation>
    : T extends object
    ? Record<string, SchemaValidation>
    : undefined;

/**
 * Type for the options passed to a ValidationHandler. This is the same as {@link ValidationOptions} but without the schema property.
 * This is to ensure the ValidationHandler does not interact with library specific schemas directly.
 * @internal
 */
export type ValidationHandlerOptions<T = unknown> = Omit<ValidationOptions<T>, "schema">;
