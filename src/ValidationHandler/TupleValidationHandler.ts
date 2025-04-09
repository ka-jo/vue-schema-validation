import { computed, markRaw, reactive, readonly, ref, Ref, shallowReadonly } from "vue";
import { SchemaValidation } from "@/Types/SchemaValidation";
import { ReadonlyRef } from "@/Types/util";
import {
    TupleSchemaValidation,
    TupleSchemaValidationErrors,
    TupleSchemaValidationFields,
} from "@/Types/TupleSchemaValidation";
import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";
import { Handler, makeIterableErrorObject } from "@/common";
import { TupleValueProxy } from "@/ValueProxy/TupleValueProxy";

export class TupleValidationHandler extends ValidationHandler<Array<unknown>> {
    private _value: TupleValueProxy;
    /**
     * The root errors of the validation
     * @remarks
     * I debated if tuple validation should have root validation. We ensure the tuple value is constrained to the
     * number of fields in the schema, so — realistically — the root should always be valid. But a user
     * could add their own validations to the tuple schema, so I decided to support root validation for such cases.
     */
    private readonly _isRootValid: Ref<boolean>;
    private readonly _isRootDirty: Ref<boolean>;
    private readonly _rootErrors: Ref<ReadonlyArray<string>>;

    readonly schema!: Schema<"tuple">;
    readonly errors: Ref<TupleSchemaValidationErrors<Array<unknown>>>;
    readonly fields: TupleSchemaValidationFields<Array<unknown>>;
    readonly isValid: Ref<boolean>;
    readonly isDirty: Ref<boolean>;

    constructor(
        schema: Schema<"tuple">,
        options: ValidationHandlerOptions<Array<unknown>>,
        errors: Record<number, ReadonlyRef<Iterable<string>>>,
        fields: Array<SchemaValidation>
    ) {
        super(schema, options);

        this.handleFieldUpdate = this.handleFieldUpdate.bind(this);

        this._isRootValid = ref(true);
        this._isRootDirty = ref(false);
        this._rootErrors = ref([]);
        this.errors = ref(makeIterableErrorObject(errors, this._rootErrors));
        this.fields = fields;
        this.isValid = computed(() => this._isRootValid.value && this.areAllFieldsValid());
        this.isDirty = computed(() => this._isRootDirty.value || this.isAnyFieldDirty());

        this._value = new TupleValueProxy(this);
    }

    validate(): boolean {
        let isRootValid = this.performRootValidation();
        if (isRootValid === false && this.options.abortEarly) {
            return false;
        }
        return this.performFieldValidation() && isRootValid;
    }

    reset(value?: Array<unknown>): void {
        value ??= this.options.value ?? this.schema.defaultValue ?? [];
        this._rootErrors.value = [];
        this._isRootValid.value = false;
        this._isRootDirty.value = false;
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].reset(value[i]);
        }
    }

    toReactive(): TupleSchemaValidation<Array<unknown>> {
        const facade = {
            [Handler]: markRaw(this),
            value: this.value,
            errors: readonly(this.errors),
            fields: shallowReadonly(ref(shallowReadonly(this.fields))),
            isValid: readonly(this.isValid),
            isDirty: readonly(this.isDirty),
            validate: this.validate.bind(this),
            reset: this.reset.bind(this),
        };
        return reactive(facade);
    }

    tearDown(): void {}

    getValue(): Array<unknown> {
        this._trackValue();
        return this._value;
    }

    setValue(value: Array<unknown>) {
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].value = value[i];
        }
        this._triggerValue();
    }

    setLength(length: number): number {
        if (length < 0) length = 0;

        while (length < this.fields.length) {
            this.fields[length].value = undefined;
            length++;
        }

        return this.fields.length;
    }

    setFieldValue(index: number, value: unknown): void {
        const field = this.fields[index];
        if (field) field.value = value;
    }

    private performRootValidation(): boolean {
        try {
            this.schema.validateRoot(this._value, this.options);
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
        for (let i = 0; i < this.fields.length; i++) {
            const field = this.fields[i];
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
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].isValid === false) {
                return false;
            }
        }
        return true;
    }

    private isAnyFieldDirty(): boolean {
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].isDirty) {
                return true;
            }
        }
        return false;
    }

    private handleFieldUpdate(index: number, value: unknown): boolean {
        if (index < this.fields.length) {
            this.fields[index].value = value;
        }
        return false;
    }

    public static create(
        schema: Schema<"tuple">,
        options: ValidationHandlerOptions
    ): TupleValidationHandler {
        if (this.hasValidTupleValue(options) === false) {
            throw new TypeError("Received initial value that is not an array for tuple schema");
        }

        const initialValue = options.value ?? schema.defaultValue ?? [];
        const fields: Array<SchemaValidation> = [];
        const errors: Record<number, ReadonlyRef<Iterable<string>>> = {};

        for (const fieldIndex of Object.keys(schema.fields) as any as number[]) {
            const fieldHandler = ValidationHandler.create(schema.fields[fieldIndex], {
                ...options,
                value: initialValue[fieldIndex],
            });
            fields[fieldIndex] = fieldHandler.toReactive();
            errors[fieldIndex] = fieldHandler.errors;
        }

        return new TupleValidationHandler(schema, options, errors, fields);
    }

    private static hasValidTupleValue(
        options: ValidationHandlerOptions
    ): options is ValidationHandlerOptions<[]> {
        return options.value === undefined || Array.isArray(options.value);
    }
}
