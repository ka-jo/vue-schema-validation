import { computed, ComputedRef, markRaw, reactive, readonly, ref, Ref, shallowReadonly } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";
import type { POJO, ReadonlyRef } from "@/Types/util";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ObjectSchemaValidation,
    ObjectSchemaValidationErrors,
} from "@/Types/ObjectSchemaValidation";
import { Handler, makeIterableErrorObject } from "@/common";

/**
 * Validation handler implementation for object schemas
 * @remarks
 * Intentionally there is no type paramater for this class. I would argue every interaction
 * within this class is much simpler if you treat the value as if it were an empty object.
 * @internal
 */
export class ObjectValidationHandler extends ValidationHandler<POJO> {
    private _value: POJO;
    private _rootErrors: Ref<ReadonlyArray<string>>;

    readonly schema!: Schema<"object">;
    readonly errors: Ref<ObjectSchemaValidationErrors>;
    /**
     * Object containing the SchemaValidation instances for each field in the object
     * @remarks
     * This object should have the same keys as the object being validated where each value is a SchemaValidation instance,
     * but for the purposes of this class, we don't care what keys are present — only that the values are SchemaValidation instances.
     */
    readonly fields: Record<string, SchemaValidation>;
    readonly isValid: ComputedRef<boolean>;
    readonly isDirty: ComputedRef<boolean>;

    constructor(
        schema: Schema<"object">,
        options: ValidationHandlerOptions<POJO>,
        value: Record<string, ReadonlyRef>,
        errors: Record<string, ReadonlyRef<Iterable<string>>>,
        fields: Record<string, SchemaValidation>
    ) {
        super(schema, options);

        this._value = reactive(value);
        this._rootErrors = ref([]);
        this.errors = ref(makeIterableErrorObject(errors, this._rootErrors));
        this.fields = fields;
        this.isValid = computed(() => this.isRootValid() && this.areAllFieldsValid());
        this.isDirty = computed(() => this.isAnyFieldDirty());
    }

    validate(): boolean {
        let isRootValid = this.performRootValidation();
        if (isRootValid === false && this.options.abortEarly) {
            return isRootValid;
        }

        return this.performFieldValidation() && isRootValid;
    }

    reset(value?: POJO): void {
        this._rootErrors.value = [];

        if (value === undefined) {
            value = this.options.value || this.schema.defaultValue || {};
        } else {
            this.options.value = value;
        }

        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            const fieldValue = value[key] ?? this.options.value?.[key];
            field.reset(fieldValue);
        }

        this._triggerValue();
    }

    toReactive(): ObjectSchemaValidation<POJO> {
        const facade = {
            [Handler]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            fields: shallowReadonly(ref(this.fields)),
            isValid: readonly(this.isValid),
            isDirty: readonly(this.isDirty),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    tearDown(): void {
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            field[Handler].tearDown();
        }
    }

    public getValue(): POJO {
        this._trackValue();
        return this._value;
    }

    public setValue(value: POJO) {
        value = Object.assign({}, this.schema.defaultValue, value);
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            field.value = value[key];
        }
        this._triggerValue();
    }

    private performRootValidation(): boolean {
        try {
            this.schema.validateRoot(this._value, this.options);
            this._rootErrors.value = [];
            return true;
        } catch (ex) {
            if (ex instanceof SchemaValidationError) {
                this._rootErrors.value = ex.errors;
                return false;
            } else {
                throw ex;
            }
        }
    }

    private isRootValid(): boolean {
        return this._rootErrors.value.length === 0;
    }

    private performFieldValidation(): boolean {
        let isValid = true;
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            if (field.validate() === false) {
                isValid = false;
                if (this.options.abortEarly) {
                    break;
                }
            }
        }
        return isValid;
    }

    private isAnyFieldDirty(): boolean {
        for (const key of Object.keys(this.fields)) {
            const field = this.fields[key];
            if (field.isDirty) {
                return true;
            }
        }
        return false;
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
        const errors: Record<string, ReadonlyRef<Iterable<string>>> = { $root: undefined as any };
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
