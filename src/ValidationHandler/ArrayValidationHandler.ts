import { ref, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
} from "@/Types/ArraySchemaValidation";
import { makeIterableErrorObject } from "@/common";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    private _value: Array<unknown>;

    readonly errors: Ref<ArraySchemaValidationErrors>;
    readonly isValid: Ref<boolean>;
    readonly fields: Record<number, SchemaValidation>;

    constructor(schema: Schema<"array">, options: ValidationHandlerOptions<Array<unknown>>) {
        super(schema, options);

        this._value = options.value ?? schema.defaultValue ?? [];
        this.errors = ref(makeIterableErrorObject({}));
        this.isValid = ref(false);
        this.fields = {};
    }

    validate(): boolean {
        throw new Error("Method not implemented.");
    }

    reset(value?: unknown): void {
        throw new Error("Method not implemented.");
    }

    toReactive(): ArraySchemaValidation<Array<unknown>> {
        throw new Error("Method not implemented.");
    }

    protected getValue(): Array<unknown> {
        this._trackValue();
        return this._value;
    }

    protected setValue(value: Array<unknown>) {
        this._value = value;
        this._triggerValue();
    }

    public static create(
        schema: Schema<"array">,
        options: ValidationHandlerOptions
    ): ArrayValidationHandler {
        if (options.value && !Array.isArray(options.value)) {
            throw new TypeError("Received initial value that is not an array for array schema");
        }
        return new ArrayValidationHandler(
            schema,
            options as ValidationHandlerOptions<Array<unknown>>
        );
    }
}
