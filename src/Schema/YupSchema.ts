import {
    ISchema as yup_ISchema,
    Schema as yup_Schema,
    ObjectSchema as yup_ObjectSchema,
    ArraySchema as yup_ArraySchema,
    LazySchema as yup_LazySchema,
    Reference as yup_Reference,
    ValidationError as yup_ValidationError,
} from "yup";

import { ValidationOptions } from "@/Types/ValidationOptions";
import {
    Schema,
    SchemaFields,
    SchemaType,
    SchemaValue,
    UnknownSchema,
    SchemaValidationError,
    SchemaValidationOptions,
} from "@/Schema";

const UNSUPPORTED_SCHEMA_TYPE_MESSAGE = "Received unsupported schema type when creating YupSchema";

/**
 * {@link Schema} implementation for interacting with schemas defined with Yup
 * @internal
 */
export class YupSchema<T extends SchemaType = SchemaType> extends Schema<T> {
    private schema: yup_Schema;

    private constructor(type: T, schema: yup_Schema, fields: SchemaFields<T>) {
        super(type, fields, schema.spec.default);
        this.schema = schema;
    }

    validate(value: SchemaValue<T>, options: SchemaValidationOptions): boolean {
        try {
            this.schema.validateSync(value, options);
            return true;
        } catch (ex) {
            if (ex instanceof yup_ValidationError) {
                throw new SchemaValidationError(ex.errors);
            } else {
                throw ex;
            }
        }
    }

    validateRoot(value: SchemaValue<T>, options: SchemaValidationOptions): boolean {
        try {
            this.schema.validateSync(value, { ...options, recursive: false });
            return true;
        } catch (ex) {
            if (ex instanceof yup_ValidationError) {
                throw new SchemaValidationError(ex.errors);
            } else {
                throw ex;
            }
        }
    }

    /**
     * This static method creates a {@link YupSchema} instance from a Yup schema.
     * @param schema - a Yup schema
     * @returns a {@link YupSchema} instance if the schema type can be determined, otherwise an {@link UnknownSchema}
     * @throws a {@link TypeError} if the schema type is not supported
     * @remarks
     * Ensuring YupSchemas are created through this method keeps the constructor simple and consistent regardless of the schema type.
     * It's unlikely a value would be passed to this function that would result in an error, but it simplifies
     * the typing within this method and prevents needing to use TypeScript tricks to prevent compiler errors
     */
    public static create(schema: yup_ReferenceOrSchema): YupSchema | UnknownSchema {
        if (YupSchema.isObjectSchema(schema)) {
            const fields: Record<string, Schema> = {};

            for (const field of Object.keys(schema.fields)) {
                fields[field] = YupSchema.create(schema.fields[field]);
            }

            return new YupSchema("object", schema, fields);
        }

        if (YupSchema.isArraySchema(schema)) {
            const fields = schema.innerType
                ? YupSchema.create(schema.innerType)
                : new UnknownSchema();

            return new YupSchema("array", schema, fields);
        }

        if (YupSchema.isLazySchema(schema)) {
            // based on my experiments, you don't actually need a value to resolve a lazy schema
            schema = schema.resolve({ value: undefined });
            return YupSchema.create(schema);
        }

        if (YupSchema.isReference(schema)) {
            return new UnknownSchema();
        }

        if (YupSchema.isYupSchema(schema)) {
            return new YupSchema("primitive", schema, undefined);
        }

        throw new TypeError(UNSUPPORTED_SCHEMA_TYPE_MESSAGE);
    }

    public static isYupSchema(thing: unknown): thing is yup_Schema {
        return typeof thing === "object" && thing !== null && "__isYupSchema__" in thing;
    }

    private static isObjectSchema(schema: yup_ReferenceOrSchema): schema is yup_ObjectSchema<any> {
        return "type" in schema && schema.type === "object";
    }

    private static isArraySchema(
        schema: yup_ReferenceOrSchema
    ): schema is yup_ArraySchema<any, any> {
        return "type" in schema && schema.type === "array";
    }

    private static isLazySchema(schema: yup_ReferenceOrSchema): schema is yup_LazySchema<any> {
        return "type" in schema && schema.type === "lazy";
    }

    private static isReference(schema: yup_ReferenceOrSchema): schema is yup_Reference<any> {
        return "__isYupRef" in schema;
    }
}

type yup_ReferenceOrSchema = yup_Reference<any> | yup_ISchema<any, any, any, any>;
