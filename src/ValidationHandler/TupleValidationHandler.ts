import { computed, markRaw, reactive, readonly, ref, Ref, shallowReadonly } from "vue";
import { SchemaValidation } from "@/Types/SchemaValidation";
import { ReadonlyRef } from "@/Types/util";
import {
    TupleSchemaValidation,
    TupleSchemaValidationErrors,
    TupleSchemaValidationFields,
} from "@/Types/TupleSchemaValidation";
import { ValidationHandler, ValidationHandlerOptions } from "@/ValidationHandler";
import { Schema } from "@/Schema";
import { HandlerInstance, makeIterableErrorObject } from "@/common";

export class TupleValidationHandler extends ValidationHandler<Array<unknown>> {
    private _value: Array<unknown>;
    /**
     * The root errors of the validation
     * @remarks
     * I debated if tuple validation should have root errors. We ensure the tuple value is constrained to the
     * number of fields in the schema, so — realistically — the root errors should always be empty. But a user
     * could add their own custom validation to the tuple schema, so I decided to add root validation for such cases.
     */
    private _rootErrors: Ref<ReadonlyArray<string>>;

    readonly schema!: Schema<"tuple">;
    readonly errors: Ref<TupleSchemaValidationErrors<Array<unknown>>>;
    readonly fields: TupleSchemaValidationFields<Array<unknown>>;
    readonly isValid: Ref<boolean>;
    readonly isDirty: Ref<boolean>;

    constructor(
        schema: Schema<"tuple">,
        options: ValidationHandlerOptions<Array<unknown>>,
        value: Array<ReadonlyRef>,
        errors: Record<number, ReadonlyRef<Iterable<string>>>,
        fields: Array<SchemaValidation>
    ) {
        super(schema, options);

        this._value = reactive(value);
        this._rootErrors = ref([]);
        this.errors = ref(makeIterableErrorObject(errors, this._rootErrors));
        this.fields = fields;
        this.isValid = computed(() => this.areAllFieldsValid());
        this.isDirty = computed(() => this.isAnyFieldDirty());
    }

    validate(): boolean {
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

    reset(value?: Array<unknown>): void {
        value ??= this.options.value ?? this.schema.defaultValue ?? [];
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].reset(value[i]);
        }
    }

    toReactive(): TupleSchemaValidation<Array<unknown>> {
        const facade = {
            [HandlerInstance]: markRaw(this),
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

    protected getValue(): Array<unknown> {
        this._trackValue();
        return this._value;
    }

    protected setValue(value: Array<unknown>) {
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].value = value[i];
        }
        this._triggerValue();
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

    public static create(
        schema: Schema<"tuple">,
        options: ValidationHandlerOptions
    ): TupleValidationHandler {
        if (this.hasValidTupleValue(options) === false) {
            throw new Error("Received initial value that is not an array for tuple schema");
        }

        const initialValue = options.value ?? schema.defaultValue ?? [];
        const value: Array<ReadonlyRef> = [];
        const fields: Array<SchemaValidation> = [];
        const errors: Record<number, ReadonlyRef<Iterable<string>>> = {};

        for (const fieldIndex of Object.keys(schema.fields) as any as number[]) {
            const fieldHandler = ValidationHandler.create(schema.fields[fieldIndex], {
                ...options,
                value: initialValue[fieldIndex],
            });
            fields[fieldIndex] = fieldHandler.toReactive();
            value[fieldIndex] = fieldHandler.value;
            errors[fieldIndex] = fieldHandler.errors;
        }

        return new TupleValidationHandler(schema, options, value, errors, fields);
    }

    private static hasValidTupleValue(
        options: ValidationHandlerOptions
    ): options is ValidationHandlerOptions<[]> {
        return options.value === undefined || Array.isArray(options.value);
    }
}
