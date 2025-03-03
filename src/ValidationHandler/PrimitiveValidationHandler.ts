import { reactive, ref, readonly, Ref } from "vue";

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
    readonly value: Ref<unknown>;
    readonly errors: Ref<ReadonlyArray<string>>;
    readonly isValid: Ref<boolean>;
    /**
     * Even though fields is not used in this class, it is required to be defined by the base class
     */
    readonly fields: undefined;

    constructor(schema: Schema<"primitive">, options: ValidationHandlerOptions) {
        super(schema, options);

        this.value = ref(this.options.value ?? this.schema.defaultValue ?? null);
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
        this.value.value = value ?? this.options.value ?? this.schema.defaultValue ?? null;
        this.errors.value = [];
        this.isValid.value = false;
    }

    toReactive(): PrimitiveSchemaValidation<unknown> {
        // for some reason, trying to create this object inline with the call to reactive will throw TypeScript compiler errors
        const facade = {
            [HandlerInstance]: this,
            value: this.value,
            errors: readonly(this.errors),
            isValid: readonly(this.isValid),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    public static create(
        schema: Schema<"primitive">,
        options: ValidationHandlerOptions
    ): PrimitiveValidationHandler {
        return new PrimitiveValidationHandler(schema, options);
    }
}
