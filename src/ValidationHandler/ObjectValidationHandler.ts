import { ref, Ref } from "vue";

import type { ReadonlyRef } from "@/Types/util";
import type { ValidationOptions } from "@/Types/ValidationOptions";
import type { Schema } from "@/Schema/Schema";
import { ValidationHandler } from "./ValidationHandler";

/**
 * Validation handler implementation for object schemas
 * @remarks
 * Intentionally there is no type paramater for this class. I would argue every interaction
 * within this class is much simpler if you treat the value as if it were an empty object.
 * @internal
 */
export class ObjectValidationHandler extends ValidationHandler<object> {
    readonly value: Ref<object>;
    readonly errors: ReadonlyRef<Iterable<string>>;
    readonly isValid: ReadonlyRef<boolean>;
    readonly fields: ObjectValidationHandlerFields;

    constructor(schema: Schema<object>, options: Omit<ValidationOptions<object>, "schema">) {
        super(schema, options);

        this.value = ref({});
        this.errors = ref([]);
        this.isValid = ref(false);
        this.fields = {};
    }

    validate(): boolean {
        throw new Error("Method not implemented.");
    }

    reset(value?: object): void {
        throw new Error("Method not implemented.");
    }
}

type ObjectValidationHandlerErrors = Record<string, ReadonlyRef<Iterable<string>>>;

type ObjectValidationHandlerFields = Record<string, ValidationHandler>;
