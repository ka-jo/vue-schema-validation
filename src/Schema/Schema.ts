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
    abstract validate(value: SchemaValue<T>, options: ValidationOptions): boolean;

    /**
     * The Schema instance to use when validating child fields of a schema.
     * @remarks
     * For object schemas, this will be an object with the same keys as the schema where each value is a {@link Schema}.
     * For array schemas, this will be a {@link Schema} instance.
     * For non-object schemas, this will be undefined
     */
    abstract readonly fields: SchemaFields<T>;

    /**
     * Default value for the schema
     */
    abstract readonly defaultValue?: Partial<T>;

    /**
     * The type of the schema. This is used to determine which ValidationHandler implementation to use.

     */
    readonly type: SchemaType;

    protected constructor(type: SchemaType) {
        this.type = type;
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
export type SchemaType = "object" | "array" | "primitive" | "unknown";

/**
 * The type of the value being validated by a schema.
 * We use 'unknown' because we don't care about the type for the most part. The value should be
 * passed from the ValidationHandler to the Schema without any need to know exactly what it is.
 * @internal
 */
export type SchemaValue<T extends SchemaType> = T extends "object"
    ? Record<string, unknown>
    : T extends "array"
    ? Array<unknown>
    : T extends "unknown"
    ? undefined
    : unknown;

/**
 * The type of the fields property of a schema.
 * @internal
 */
export type SchemaFields<T extends SchemaType> = T extends "object"
    ? Record<string, Schema>
    : T extends "array"
    ? Schema
    : undefined;
