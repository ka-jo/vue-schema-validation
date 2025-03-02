import { ref, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { ReadonlyRef } from "@/Types/util";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type { ArraySchemaValidation } from "@/Types/ArraySchemaValidation";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    readonly value: Ref<Array<unknown>>;
    readonly errors: ReadonlyRef<Iterable<string>>;
    readonly isValid: ReadonlyRef<boolean>;
    readonly fields: Record<number, SchemaValidation>;

    constructor(schema: Schema<"array">, options: ValidationHandlerOptions<Array<unknown>>) {
        super(schema, options);

        this.value = ref([]);
        this.errors = ref([]);
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

    public static create(
        schema: Schema<"array">,
        options: ValidationHandlerOptions
    ): ArrayValidationHandler {
        if (options.value && !Array.isArray(options.value)) {
            throw new TypeError("Received initial value that is not an array for array schema");
        }
        throw new Error("Method not implemented.");
    }
}
