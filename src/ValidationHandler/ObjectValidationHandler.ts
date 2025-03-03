import { markRaw, reactive, readonly, ref, Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema";
import type { ReadonlyRef } from "@/Types/util";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ObjectSchemaValidation,
    ObjectSchemaValidationErrors,
} from "@/Types/ObjectSchemaValidation";
import { HandlerInstance } from "@/common";

/**
 * Validation handler implementation for object schemas
 * @remarks
 * Intentionally there is no type paramater for this class. I would argue every interaction
 * within this class is much simpler if you treat the value as if it were an empty object.
 * @internal
 */
export class ObjectValidationHandler extends ValidationHandler<object> {
    readonly value: Ref<object>;
    readonly errors: Ref<ObjectSchemaValidationErrors>;
    readonly isValid: Ref<boolean>;
    readonly fields: Record<string, SchemaValidation>;

    constructor(
        schema: Schema<"object">,
        options: ValidationHandlerOptions<object>,
        value: Record<string, ReadonlyRef>,
        errors: Record<string, ReadonlyRef<Iterable<string>>>,
        fields: Record<string, SchemaValidation>
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

    toReactive(): ObjectSchemaValidation<object> {
        const facade = {
            [HandlerInstance]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            isValid: readonly(this.isValid),
            fields: this.fields,
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    public static create(
        schema: Schema<"object">,
        options: ValidationHandlerOptions
    ): ObjectValidationHandler {
        if (options.value && typeof options.value !== "object") {
            throw new TypeError("Received initial value that is not an object for object schema");
        }

        const fields: Record<string, SchemaValidation> = {};
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
