import { reactive, ref, readonly, Ref, markRaw } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import { Schema, SchemaValidationError } from "@/Schema";
import { Handler } from "@/common";

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
    readonly isDirty: Ref<boolean>;

    constructor(schema: Schema, options: ValidationHandlerOptions) {
        super(schema, options);

        if (options.value === null) {
            this._value = null;
        } else {
            this._value = this.options.value ?? this.schema.defaultValue ?? null;
        }
        this.errors = ref([]);
        this.isValid = ref(false);
        this.isDirty = ref(false);
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
                throw e;
            }
        }
        return this.isValid.value;
    }

    reset(value: unknown = this.options.value): void {
        this.setValue(value);
        this.errors.value = [];
        this.isValid.value = false;
        this.isDirty.value = false;
    }

    toReactive(): PrimitiveSchemaValidation<unknown> {
        // for some reason, trying to create this object inline with the call to reactive will throw TypeScript compiler errors
        const facade = {
            [Handler]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            isValid: readonly(this.isValid),
            isDirty: readonly(this.isDirty),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    tearDown(): void {
        // no teardown necessary
    }

    getValue(): unknown {
        this._trackValue();
        return this._value;
    }

    setValue(value: unknown) {
        if (value !== null) {
            // We should allow null values to be set, but we should not allow undefined values
            value ??= this.schema.defaultValue ?? null;
        }
        if (value !== this._value) {
            this._value = value;
            this.isDirty.value = true;
            this._triggerValue();
        }
    }

    public static create(
        schema: Schema,
        options: ValidationHandlerOptions
    ): PrimitiveValidationHandler {
        return new PrimitiveValidationHandler(schema, options);
    }
}
