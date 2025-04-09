import { computed, markRaw, reactive, readonly, ref, shallowReadonly, watch, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
} from "@/Types/ArraySchemaValidation";
import { ErrorObjectWithRoot, Handler, makeIterableErrorObject, noop } from "@/common";
import { SchemaValidationError } from "@/Schema";
import { ReadonlyRef } from "@/Types/util";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    private _value!: Array<unknown>;
    private _stopValueWatcher: () => void = noop;
    private _rootErrors: Ref<ReadonlyArray<string>>;
    private _isRootValid: Ref<boolean>;
    private _isRootDirty: Ref<boolean>;
    private _fields: Map<number, SchemaValidation>;
    private _stopFieldsWatcher: () => void = noop;

    readonly schema!: Schema<"array">;
    readonly errors: Ref<ArraySchemaValidationErrors, ErrorObjectWithRoot>;
    readonly fields: Ref<ReadonlyArray<SchemaValidation>>;
    readonly isValid: ReadonlyRef<boolean>;
    readonly isDirty: ReadonlyRef<boolean>;

    constructor(schema: Schema<"array">, options: ValidationHandlerOptions<Array<unknown>>) {
        super(schema, options);

        this._rootErrors = ref([]);
        this._isRootValid = ref(false);
        this._isRootDirty = ref(false);
        this._fields = new Map();
        this.errors = ref(makeIterableErrorObject({}, this._rootErrors));
        this.fields = ref([]);
        this.isValid = computed(() => this._isRootValid.value && this.areAllFieldsValid());
        this.isDirty = computed(() => this._isRootDirty.value || this.isAnyFieldDirty());
        this.handleFieldUpdate = this.handleFieldUpdate.bind(this);

        this.initializeNewValue(options.value ?? schema.defaultValue ?? []);
    }

    validate(): boolean {
        const isRootValid = this.performRootValidation();
        if (isRootValid === false && this.options.abortEarly) {
            return isRootValid;
        }

        return this.performFieldValidation() && isRootValid;
    }

    reset(resetValue?: Array<unknown>): void {
        resetValue ??= this.options.value ?? this.schema.defaultValue ?? [];
        this._rootErrors.value = [];
        this._isRootValid.value = false;
        this._isRootDirty.value = false;

        this.initializeNewValue(resetValue, true);
    }

    toReactive(): ArraySchemaValidation<Array<unknown>> {
        const facade = {
            [Handler]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            fields: shallowReadonly(this.fields),
            isValid: readonly(this.isValid),
            isDirty: readonly(this.isDirty),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    tearDown(): void {
        this._stopValueWatcher();
        this._stopFieldsWatcher();
        for (const [i, field] of this._fields) {
            field[Handler].tearDown();
        }
        this._fields = new Map();
    }

    getValue(): Array<unknown> {
        this._trackValue();
        return this._value;
    }

    setValue(value: Array<unknown>) {
        this._isRootDirty.value = true;
        this.initializeNewValue(value);
        this._triggerValue();
    }

    private initializeNewValue(newValue: Array<unknown>, isReset = false): void {
        this._stopValueWatcher();
        this._stopFieldsWatcher();

        const value = new Array<unknown>();
        const fieldValues = new Array<Ref<unknown>>();
        const fields = new Array<SchemaValidation>();
        const errors = makeIterableErrorObject({}, this._rootErrors);

        let i = 0;
        while (i < newValue.length) {
            let field = this._fields.get(i);
            if (field) {
                if (isReset) field.reset(newValue[i]);
                else field.value = newValue[i];
            } else {
                field = this.addField(newValue[i]);
            }
            const fieldHandler = field[Handler];
            value[i] = field.value;
            fieldValues[i] = fieldHandler.value;
            fields[i] = field;
            errors[i] = fieldHandler.errors;
            i++;
        }

        while (i < this._fields.size) {
            const field = this._fields.get(i)!;
            field[Handler].tearDown();
            this._fields.delete(i);
            i++;
        }

        this._value = reactive(value);
        this.fields.value = fields;
        this.errors.value = errors;

        this.watchValue();
        this.watchFieldValues(fieldValues);
    }

    private performRootValidation(): boolean {
        try {
            this.schema.validateRoot(this.value.value, this.options);
            this._rootErrors.value = [];
            this._isRootValid.value = true;
            return true;
        } catch (e) {
            if (e instanceof SchemaValidationError) {
                this._rootErrors.value = e.errors;
                this._isRootValid.value = false;
                return false;
            } else {
                throw e;
            }
        }
    }

    private performFieldValidation(): boolean {
        let isValid = true;
        for (let i = 0; i < this.fields.value.length; i++) {
            const field = this.fields.value[i];
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
        for (const field of this._fields.values()) {
            if (field.isValid === false) return false;
        }
        return true;
    }

    private isAnyFieldDirty(): boolean {
        for (const field of this.fields.value) {
            if (field.isDirty) return true;
        }
        return false;
    }

    private addField(value: unknown): SchemaValidation {
        const index = this._fields.size;
        const handler = ValidationHandler.create(this.schema.fields, {
            ...this.options,
            value,
        });
        const field = handler.toReactive();

        this._fields.set(index, field);

        return field;
    }

    private watchValue() {
        this._stopValueWatcher = watch(this._value, this.setValue, {
            deep: false,
            flush: "sync",
        });
    }

    private watchFieldValues(fieldValues: Array<Ref<unknown>>) {
        this._stopFieldsWatcher = watch(fieldValues, this.handleFieldUpdate, {
            deep: false,
            flush: "sync",
        });
    }

    private handleFieldUpdate(value: Array<unknown>) {
        this._stopValueWatcher();
        this._value = reactive(value);
        this._stopValueWatcher = watch(this._value, this.setValue, {
            deep: false,
            flush: "sync",
        });
        this._triggerValue();
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
