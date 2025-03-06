import { computed, markRaw, reactive, readonly, ref, shallowReadonly, watch, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
} from "@/Types/ArraySchemaValidation";
import { HandlerInstance, makeIterableErrorObject } from "@/common";
import { SchemaValidationError } from "@/Schema";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    /**
     * The value of the array being validated
     * @remarks
     * This should contain the values from each SchemaValidation instance in the fields array.
     * It's important that this array only ever contain proxies from Vue (when validating non-primitive types), so that
     * the values are reaactive and subsequent calls to setValue always have the same reference to the value in the fields array.
     * Consider when a new object is added to the array: the first time the value is added, setValue will get a reference
     * to a raw object before it is made reactive.
     */
    private _value!: Array<unknown>;
    private _stopValueWatcher!: () => void;
    private _rootErrors: Ref<ReadonlyArray<string>>;
    private _isRootDirty: Ref<boolean>;
    /**
     * This map is used to keep references to SchemaValidation instances for each element in the array.
     * @remarks
     * This a performance optimization to avoid creating new instances for each element every time the value is set.
     * The values stored here should be the value from the SchemaValidation instance, not values coming into the setValue method.
     * This is because the value of the SchemaValidation instance will be proxy objects from Vue in the case of non-primitive types,
     * but the value coming into setValue could be a raw value before it is made reactive.
     */
    private _fieldsByValue: Map<unknown, SchemaValidation>;

    readonly schema!: Schema<"array">;
    readonly errors: Ref<ArraySchemaValidationErrors>;
    readonly fields: Ref<ReadonlyArray<SchemaValidation>>;
    readonly isValid: Ref<boolean>;
    readonly isDirty: Ref<boolean>;

    constructor(schema: Schema<"array">, options: ValidationHandlerOptions<Array<unknown>>) {
        super(schema, options);

        this._rootErrors = ref([]);
        this._isRootDirty = ref(false);
        this._fieldsByValue = new Map();

        this.initializeNewValue(options.value ?? schema.defaultValue ?? []);

        this.errors = ref(makeIterableErrorObject({}, this._rootErrors));
        this.fields = ref([]);
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
        const facade = {
            [HandlerInstance]: markRaw(this),
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

    protected getValue(): Array<unknown> {
        this._trackValue();
        return this._value;
    }

    protected setValue(value: Array<unknown>) {
        this._stopValueWatcher();
        this.initializeNewValue(value);
        this._triggerValue();
        requestAnimationFrame(() => this.cleanFieldMap());
    }

    private initializeNewValue(value: Array<unknown>) {
        const newValue = [];
        const fields = [];
        for (const el of value) {
            let field = this._fieldsByValue.get(el);
            if (!field) {
                field = this.createField(el);
            }
            newValue.push(field.value);
            fields.push(field);
        }
        this._value = reactive(newValue);
        this.fields.value = fields;
        this._stopValueWatcher = watch(this._value, (val) => this.setValue(val), { deep: false });
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
        for (const field of this.fields.value) {
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
        for (const field of this.fields.value) {
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

    private cleanFieldMap() {
        this._fieldsByValue.clear();
        for (const field of this.fields.value) {
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
