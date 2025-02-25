import { ref, Ref } from "vue";

import { ValidationOptions } from "@/Types/ValidationOptions";
import { Schema } from "@/Schema/Schema";

import { ValidationHandler } from "./ValidationHandler";

/**
 * ValidationHandler implementation for schemas representing a single value.
 * @remarks
 * Despite the name, this class is not limited to primitive types. It can be used for any schema that represents
 * a single value, but may not be "primitive" in the traditional sense (e.g. Date)
 */
export class PrimitiveValidationHandler extends ValidationHandler<unknown> {
    readonly value: Ref<unknown, unknown>;
    readonly errors: Ref<Iterable<string>, Iterable<string>>;
    readonly isValid: Ref<boolean, boolean>;
    /**
     * Even though fields is not used in this class, it is required to be defined by the base class
     */
    readonly fields: undefined;

    constructor(schema: Schema<unknown>, options: Omit<ValidationOptions<unknown>, "schema">) {
        super(schema, options);

        this.value = ref(undefined);
        this.errors = ref([]);
        this.isValid = ref(false);
    }

    validate(): boolean {
        throw new Error("Method not implemented.");
    }

    reset(value?: unknown): void {
        throw new Error("Method not implemented.");
    }
}
