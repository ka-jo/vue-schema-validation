import { computed, markRaw, reactive, readonly, ref, shallowReadonly, watch, type Ref } from "vue";

import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import type { Schema } from "@/Schema/Schema";
import type { SchemaValidation } from "@/Types/SchemaValidation";
import type {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
} from "@/Types/ArraySchemaValidation";
import { ErrorObjectWithRoot, HandlerInstance, makeIterableErrorObject } from "@/common";
import { SchemaValidationError } from "@/Schema";
import { ReadonlyRef } from "@/Types/util";

export class ArrayValidationHandler extends ValidationHandler<Array<unknown>> {
    private _stopValueWatcher: () => void = () => {};
    private _rootErrors: Ref<ReadonlyArray<string>>;
    private _isRootValid: Ref<boolean>;
    private _isRootDirty: Ref<boolean>;
    /**
     * This map is used to keep references to SchemaValidation instances for each element in the array.
     * @remarks
     * This a performance optimization to avoid creating new instances for each element every time the value is set.
     * The values stored here should be the value from the SchemaValidation instance, not values coming into the setValue method.
     * This is because the value of the SchemaValidation instance will be proxy objects from Vue in the case of non-primitive types,
     * but the value coming into setValue could be a raw value before it is made reactive.
     */
    private _fieldsByValue?: Map<unknown, SchemaValidation>;

    /**
     * The reactive value of the array
     * @remarks
     * Unlike other ValidationHandler implementations, the value of an array is a computed ref to ensure
     * that the value is always in sync with the fields. When the value of a field is changed through the
     * fields property of an ArrayValidationhandler, the value of the array should be updated as well.
     */
    readonly value: Ref<Array<unknown>>;
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
        if (this.schema.fields.type !== "primitive") {
            this._fieldsByValue = new Map();
        }
        this.value = computed({
            get: this.getValue.bind(this),
            set: this.setValue.bind(this),
        });
        this.errors = ref(makeIterableErrorObject({}, this._rootErrors));
        this.fields = ref([]);
        this.isValid = computed(() => this._isRootValid.value && this.areAllFieldsValid());
        this.isDirty = computed(() => this._isRootDirty.value || this.isAnyFieldDirty());

        this.initializeNewValue(options.value ?? schema.defaultValue ?? []);
    }

    validate(): boolean {
        let isRootValid = this.performRootValidation();
        if (isRootValid === false && this.options.abortEarly) {
            return isRootValid;
        }

        return this.performFieldValidation() && isRootValid;
    }

    reset(value?: Array<unknown>): void {
        this.setValue(value ?? this.options.value ?? this.schema.defaultValue ?? []);
        this._rootErrors.value = [];
        this._isRootValid.value = false;
        this._isRootDirty.value = false;

        for (const field of this.fields.value) {
            field.reset();
        }
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
        let value = [];
        for (let i = 0; i < this.fields.value.length; i++) {
            value.push(this.fields.value[i].value);
        }
        value = reactive(value);
        this._stopValueWatcher();
        this._stopValueWatcher = watch(value, (val) => this.setValue(val), {
            deep: false,
            flush: "sync",
        });
        return value;
    }

    protected setValue(value: Array<unknown>) {
        this._isRootDirty.value = true;
        this.initializeNewValue(value);
        this.requestCleanFieldMap();
    }

    private initializeNewValue(value: Array<unknown>) {
        const fields = new Array<SchemaValidation>();
        const errors = makeIterableErrorObject({}, this._rootErrors);

        for (let i = 0; i < value.length; i++) {
            const el = value[i];
            const field = this.getOrCreateField(el);
            const fieldHandler = field[HandlerInstance];
            fields.push(field);
            errors[i] = fieldHandler.errors;
        }

        this.fields.value = fields;
        this.errors.value = errors;
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

    private requestCleanFieldMap() {
        if (this._fieldsByValue) {
            requestAnimationFrame(() => {
                this._fieldsByValue!.clear();
                for (const field of this.fields.value) {
                    this._fieldsByValue!.set(field.value, field);
                }
            });
        }
    }

    private getOrCreateField(value: unknown): SchemaValidation {
        // If the schema is a primitive, we don't want to reuse the same schema validation instance
        if (this.schema.fields.type === "primitive") {
            return ValidationHandler.create(this.schema.fields, {
                ...this.options,
                value,
            }).toReactive();
        }
        let field = this._fieldsByValue!.get(value);
        if (!field) {
            field = ValidationHandler.create(this.schema.fields, {
                ...this.options,
                value,
            }).toReactive();
            this._fieldsByValue!.set(field.value, field);
        }
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
