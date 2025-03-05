import { computed, markRaw, reactive, readonly, ref, Ref, shallowReadonly } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema";
import type { POJO, ReadonlyRef } from "@/Types/util";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ObjectSchemaValidation,
    ObjectSchemaValidationErrors,
} from "@/Types/ObjectSchemaValidation";
import { HandlerInstance, iterableFieldIterator, makeIterableErrorObject } from "@/common";

/**
 * Validation handler implementation for object schemas
 * @remarks
 * Intentionally there is no type paramater for this class. I would argue every interaction
 * within this class is much simpler if you treat the value as if it were an empty object.
 * @internal
 */
export class ObjectValidationHandler extends ValidationHandler<POJO> {
    private _value: POJO;

    readonly schema!: Schema<"object">;
    readonly errors: Ref<ObjectSchemaValidationErrors>;
    readonly isValid: Ref<boolean>;
    readonly fields: Record<string, SchemaValidation>;

    constructor(
        schema: Schema<"object">,
        options: ValidationHandlerOptions<POJO>,
        value: Record<string, ReadonlyRef>,
        errors: Record<string, ReadonlyRef<Iterable<string>>>,
        fields: Record<string, SchemaValidation>
    ) {
        super(schema, options);

        this._value = reactive(value);
        this.errors = ref(makeIterableErrorObject(errors));
        this.isValid = computed(() => this.areAllFieldsValid());
        this.fields = fields;
    }

    validate(): boolean {
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            const isFieldValid = field.validate();
            if (isFieldValid === false && this.options.abortEarly) {
                break;
            }
        }

        return this.isValid.value;
    }

    reset(value: POJO = {}): void {
        value = Object.assign({}, this.schema.defaultValue, this.options.value, value);
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            field.reset(value[key]);
        }
        this._triggerValue();
    }

    toReactive(): ObjectSchemaValidation<POJO> {
        const facade = {
            [HandlerInstance]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            isValid: readonly(this.isValid),
            fields: shallowReadonly(ref(this.fields)),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    protected getValue(): POJO {
        this._trackValue();
        return this._value;
    }

    protected setValue(value: POJO) {
        value = Object.assign({}, this.schema.defaultValue, value);
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            field.value = value[key];
        }
        this._triggerValue();
    }

    private areAllFieldsValid(): boolean {
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            if (!field.isValid) {
                return false;
            }
        }
        return true;
    }

    public static create<POJO>(
        schema: Schema<"object">,
        options: ValidationHandlerOptions
    ): ObjectValidationHandler {
        if (this.hasValidObjectValue(options) === false) {
            throw new TypeError("Received initial value that is not an object for object schema");
        }

        const initialValue: Record<string, unknown> = options.value ?? schema.defaultValue ?? {};
        const fields: Record<string, SchemaValidation> = {};
        const value: Record<string, ReadonlyRef> = {};
        const errors: Record<string, ReadonlyRef<Iterable<string>>> = {};
        // We've already walked through all fields when creating the schema, so this isn't as efficient as it could be
        // I wonder if there's a way to initialize the schema fields and validation handler fields at the same time 🤔
        for (const fieldName of Object.keys(schema.fields)) {
            const fieldHandler = ValidationHandler.create(schema.fields[fieldName], {
                ...options,
                value: initialValue[fieldName],
            });
            fields[fieldName] = fieldHandler.toReactive();
            value[fieldName] = fieldHandler.value;
            errors[fieldName] = fieldHandler.errors;
        }

        return new ObjectValidationHandler(schema, options, value, errors, fields);
    }

    private static hasValidObjectValue(
        options: ValidationHandlerOptions
    ): options is ValidationHandlerOptions<POJO> {
        if (options.value) {
            return typeof options.value === "object" && !Array.isArray(options.value);
        }
        return true;
    }
}
