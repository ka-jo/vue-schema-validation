import { reactive, ref, readonly, Ref, markRaw } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import { Schema, SchemaValidationError } from "@/Schema";
import { HandlerInstance } from "@/common";

/**
 * {@link ValidationHandler} implementation for schemas representing a single value.
 * @remarks
 * Despite the name, this class is not limited to primitive types. It can be used for any schema that represents
 * a single value, but may not be "primitive" in the traditional sense (e.g. Date)
 */
export class PrimitiveValidationHandler extends ValidationHandler<unknown> {
    private _value: unknown;

    readonly errors: Ref<ReadonlyArray<string>>;
    readonly isValid: Ref<boolean>;
    readonly fields: undefined;

    constructor(schema: Schema, options: ValidationHandlerOptions) {
        super(schema, options);

        this._value = this.options.value ?? this.schema.defaultValue ?? null;
        this.errors = ref([]);
        this.isValid = ref(false);
    }

    validate(): boolean {
        try {
            this.schema.validate(this.value.value, this.options);
            this.errors.value = [];
            this.isValid.value = true;
        } catch (e) {
            this.isValid.value = false;
            if (e instanceof SchemaValidationError) {
                this.errors.value = e.errors;
            } else {
                // If it isn't a SchemaValidationError, we don't know what it is, so we shouldn't populate the errors with it
                this.errors.value = [];
            }
        }
        return this.isValid.value;
    }

    reset(value?: unknown): void {
        this.setValue(value);
        this.errors.value = [];
        this.isValid.value = false;
    }

    toReactive(): PrimitiveSchemaValidation<unknown> {
        // for some reason, trying to create this object inline with the call to reactive will throw TypeScript compiler errors
        const facade = {
            [HandlerInstance]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            isValid: readonly(this.isValid),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    protected getValue(): unknown {
        this._trackValue();
        return this._value;
    }

    protected setValue(value: unknown) {
        this._value = value ?? this.options.value ?? this.schema.defaultValue ?? null;
        this._triggerValue();
    }

    public static create(
        schema: Schema,
        options: ValidationHandlerOptions
    ): PrimitiveValidationHandler {
        return new PrimitiveValidationHandler(schema, options);
    }
}
