import { ref, type Ref } from "vue";

import { ValidationOptions } from "@/Types/ValidationOptions";
import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { Schema } from "@/Schema/Schema";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    readonly value: Ref<Array<unknown>>;
    readonly errors: Ref<Iterable<string>>;
    readonly isValid: Ref<boolean, boolean>;
    readonly fields: Record<number, ValidationHandler>;

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
