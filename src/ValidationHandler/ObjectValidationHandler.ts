import { reactive, ref, Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { ReadonlyRef } from "@/Types/util";
import type { Schema } from "@/Schema";
import { ObjectValidation, Validation } from "@/Types/Validation";

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
    readonly fields: Record<string, Validation>;

    constructor(
        schema: Schema<"object">,
        options: ValidationHandlerOptions<object>,
        value: Record<string, ReadonlyRef>,
        errors: Record<string, ReadonlyRef<Iterable<string>>>,
        fields: Record<string, Validation>
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

    toReactive(): ObjectValidation<object> {
        throw new Error("Method not implemented.");
    }

    public static create(
        schema: Schema<"object">,
        options: ValidationHandlerOptions
    ): ObjectValidationHandler {
        if (options.value && typeof options.value !== "object") {
            throw new TypeError("Received initial value that is not an object for object schema");
        }

        const fields: Record<string, Validation> = {};
        const value: Record<string, ReadonlyRef> = {};
        const errors: Record<string, ReadonlyRef<Iterable<string>>> = {};
        // We've already walked through all fields when creating the schema, so this isn't as efficient as it could be
        // I wonder if there's a way to initialize the schema fields and validation handler fields at the same time 🤔
        for (const fieldName of Object.keys(schema.fields)) {
            const fieldHandler = ValidationHandler.create(schema.fields[fieldName], options);
            fields[fieldName] = fieldHandler.toReactive();
            value[fieldName] = fieldHandler.value;
            errors[fieldName] = fieldHandler.errors;
        }

        return new ObjectValidationHandler(schema, options, value, errors, fields);
    }
}

type ObjectValidationHandlerErrors = Iterable<string> &
    Record<string, ReadonlyRef<Iterable<string>>>;
