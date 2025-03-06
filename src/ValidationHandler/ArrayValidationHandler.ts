import { computed, ref, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
} from "@/Types/ArraySchemaValidation";
import { makeIterableErrorObject } from "@/common";
import { SchemaValidationError } from "@/Schema";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    private _value: Array<unknown>;
    private _rootErrors: Ref<ReadonlyArray<string>>;
    private _isRootDirty: Ref<boolean>;
    private _fieldsByValue: Map<unknown, SchemaValidation>;

    readonly schema!: Schema<"array">;
    readonly errors: Ref<ArraySchemaValidationErrors>;
    readonly fields: ReadonlyArray<SchemaValidation>;
    readonly isValid: Ref<boolean>;
    readonly isDirty: Ref<boolean>;

    constructor(schema: Schema<"array">, options: ValidationHandlerOptions<Array<unknown>>) {
        super(schema, options);

        this._value = options.value ?? schema.defaultValue ?? [];
        this._rootErrors = ref([]);
        this._isRootDirty = ref(false);
        this._fieldsByValue = new Map();
        this.errors = ref(makeIterableErrorObject({}, this._rootErrors));
        this.fields = [];
        this.isValid = computed(() => this.isRootValid() && this.areAllFieldsValid());
        this.isDirty = computed(() => this._isRootDirty.value && this.isAnyFieldDirty());
    }

    validate(): boolean {
        let isRootValid = this.performRootValidation();
        if (isRootValid === false && this.options.abortEarly) {
            return isRootValid;
        }

        return this.performFieldValidation() && isRootValid;
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
        const fields = [];
        for (const el of value) {
            let field = this._fieldsByValue.get(el);
            if (!field) {
                field = this.createField(el);
            }
            fields.push(field);
        }

        this._triggerValue();
        requestAnimationFrame(() => this.cleanFieldMap());
    }

    private performRootValidation(): boolean {
        try {
            this.schema.validateRoot(this._value, this.options);
            this._rootErrors.value = [];
            return true;
        } catch (e) {
            if (e instanceof SchemaValidationError) {
                this._rootErrors.value = [];
                return false;
            } else {
                throw e;
            }
        }
    }

    private isRootValid(): boolean {
        return this._rootErrors.value.length === 0;
    }

    private performFieldValidation(): boolean {
        let isValid = true;
        for (const field of this.fields) {
            if (field.validate() === false) {
                isValid = false;
                if (this.options.abortEarly) {
                    break;
                }
            }
        }
        return isValid;
    }

    private areAllFieldsValid(): boolean {
        for (const field of this.fields) {
            if (field.isValid === false) return false;
        }
        return true;
    }

    private isAnyFieldDirty(): boolean {
        for (const field of this.fields) {
            if (field.isDirty) return true;
        }
        return false;
    }

    private cleanFieldMap() {
        this._fieldsByValue.clear();
        for (const field of this.fields) {
            this._fieldsByValue.set(field.value, field);
        }
    }

    private createField(value: unknown): SchemaValidation {
        const field = ValidationHandler.create(this.schema.fields, {
            ...this.options,
            value,
        }).toReactive();
        this._fieldsByValue.set(field.value, field);
        return field;
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
