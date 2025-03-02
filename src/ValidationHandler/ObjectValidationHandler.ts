import { ref, Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { ReadonlyRef } from "@/Types/util";
import type { Schema } from "@/Schema";

/**
 * Validation handler implementation for object schemas
 * @remarks
 * Intentionally there is no type paramater for this class. I would argue every interaction
 * within this class is much simpler if you treat the value as if it were an empty object.
 * @internal
 */
export class ObjectValidationHandler extends ValidationHandler<object> {
    readonly value: Ref<object>;
    readonly errors: ReadonlyRef<ObjectValidationHandlerErrors>;
    readonly isValid: ReadonlyRef<boolean>;
    readonly fields: Record<string, ValidationHandler>;

    constructor(
        schema: Schema<"object">,
        options: ValidationHandlerOptions<object>,
        value: Record<string, ReadonlyRef>,
        errors: Record<string, ReadonlyRef<Iterable<string>>>,
        fields: Record<string, ValidationHandler>
    ) {
        super(schema, options);

        this.value = ref({});
        //@ts-expect-error
        this.errors = ref([]);
        this.isValid = ref(false);
        this.fields = fields;
    }

    validate(): boolean {
        throw new Error("Method not implemented.");
    }

    reset(value?: object): void {
        throw new Error("Method not implemented.");
    }

    public static create(
        schema: Schema<"object">,
        options: ValidationHandlerOptions
    ): ObjectValidationHandler {
        if (options.value && typeof options.value !== "object") {
            throw new TypeError("Received initial value that is not an object for object schema");
        }

        const fields: Record<string, ValidationHandler> = {};
        const value: Record<string, ReadonlyRef> = {};
        const errors: Record<string, ReadonlyRef<Iterable<string>>> = {};

        for (const fieldName of Object.keys(schema.fields)) {
            fields[fieldName] = ValidationHandler.create(schema.fields[fieldName], options);
            value[fieldName] = fields[fieldName].value;
            errors[fieldName] = fields[fieldName].errors;
        }

        return new ObjectValidationHandler(schema, options, value, errors, fields);
    }
}

type ObjectValidationHandlerErrors = Iterable<string> &
    Record<string, ReadonlyRef<Iterable<string>>>;
