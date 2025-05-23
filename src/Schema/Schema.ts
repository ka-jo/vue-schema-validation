import { YupSchema, type SchemaValidationError } from "@/Schema";
import { ValidationOptions } from "@/Types/ValidationOptions";

const UNSUPPORTED_SCHEMA_TYPE_MESSAGE =
    "Received unsupported schema type when determining which schema implementation to use";

/**
 * Wrapper to allow implementing different schema validation libraries
 * @internal
 */
export abstract class Schema<T extends SchemaType = SchemaType> {
    /**
     * Validate the value using the provided options
     * @param value - Value to validate
     * @param options - Options to use for validation
     * @returns true if the data was valid
     * @throws a {@link SchemaValidationError} if the data was invalid
     */
    abstract validate(value: SchemaValue<T>, options: SchemaValidationOptions): boolean;

    /**
     * Validate the root value of the schema
     * @param value - Value to validate
     * @param options - Options to use for validation
     * @returns true if the data was valid
     * @throws a {@link SchemaValidationError} if the data was invalid
     * @remarks
     * Object and array schemas can have validation rules that only apply to the "root" value as opposed to the fields.
     * For example, an array can have rules for min/max length, and an object can have a rule for no unknown fields.
     * In order to support the {@link ValidationOptions.abortEarly | abortEarly} option, we need to be able to validate
     * the root value separately from the fields.
     */
    abstract validateRoot(value: SchemaValue<T>, options: SchemaValidationOptions): boolean;

    /**
     * The type of the schema. This is used to determine which ValidationHandler implementation to use.
     */
    readonly type: T;

    /**
     * The Schema instance to use when validating child fields of a schema.
     * @remarks
     * For object schemas, this will be an object with the same keys as the schema where each value is a {@link Schema}.
     * For array schemas, this will be a {@link Schema} instance.
     * For non-object schemas, this will be undefined
     */
    readonly fields: SchemaFields<T>;

    /**
     * Default value for the schema
     * @remarks
     * This value will be uses when initializing validation if no {@link ValidationOptions.value | value is provided}
     */
    readonly defaultValue?: SchemaDefaultValue<T>;

    protected constructor(type: T, fields: SchemaFields<T>, defaultValue: SchemaDefaultValue<T>) {
        this.type = type;
        this.fields = fields;
        this.defaultValue = defaultValue;
    }

    /**
     * This static method creates a {@link Schema} instance from a library specific schema object.
     * @param schema - a library specific schema object
     * @returns a {@link Schema} instance using the appropriate implementation based on the schema provided
     * @throws a {@link TypeError} if the schema type is not supported
     */
    public static create(schema: unknown): Schema {
        if (YupSchema.isYupSchema(schema)) {
            return YupSchema.create(schema);
        }

        throw new TypeError(UNSUPPORTED_SCHEMA_TYPE_MESSAGE);
    }
}

/**
 * Union of all possible schema types.
 * @remarks
 * We use the term "primitive" here loosely. Primitive in this case means any schema type that represents
 * a single value, but is not necessarily a JavaScript primitive type. For example, a schema that represents
 * a date value would be considered a "primitive" schema, even though Date is not a JavaScript primitive type.
 * We use "unknown" just so we can more consistently create a schema, even if we don't know how to handle it as
 * would be the case with Yup references for example.
 * @internal
 */
export type SchemaType = "object" | "array" | "tuple" | "primitive" | "unknown";

/**
 * The type of the value being validated by a schema.
 * We use 'unknown' because we don't care about the type for the most part. The value should be
 * passed from the ValidationHandler to the Schema without any need to know exactly what it is.
 * @internal
 */
export type SchemaValue<T extends SchemaType> = T extends "object"
    ? Record<string, unknown>
    : T extends "array" | "tuple"
    ? Array<unknown>
    : T extends "unknown"
    ? undefined
    : unknown;

/**
 * @internal
 */
export type SchemaDefaultValue<T extends SchemaType> = T extends "object"
    ? Record<string, unknown>
    : T extends "array" | "tuple"
    ? Array<unknown>
    : unknown;

/**
 * The type of the fields property of a schema.
 * @internal
 */
export type SchemaFields<T extends SchemaType> = T extends "object"
    ? Record<string, Schema>
    : T extends "array"
    ? Schema
    : T extends "tuple"
    ? Array<Schema>
    : undefined;

/**
 * @internal
 */
export type SchemaValidationOptions = Omit<ValidationOptions, "schema">;

/**
 * @internal
 */
export type DerivedSchemaType<T> = T extends Array<any>
    ? "array"
    : T extends object
    ? "object"
    : unknown extends T
    ? "unknown"
    : "primitive";
