import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { DeepPartial } from "@/Types/util";

/**
 * @public
 */
export interface ObjectSchemaValidation<T extends object = Record<string, unknown>>
    extends ISchemaValidation<ObjectSchemaValidationValue<T>> {
    value: ObjectSchemaValidationValue<T>;
    readonly fields: ObjectSchemaValidationFields<T>;
    readonly errors: ObjectSchemaValidationErrors<T>;

    reset(value?: DeepPartial<T>): void;
}

/**
 * The type for the value of an object schema validation
 * @remarks
 * This type intentionally ensures that a key can never have an undefined value. This is because
 * each key represents a property that was explicitly defined on the schema. If a property is
 * optional, the value can be `null` to represent that it is not set.
 * @public
 */
export type ObjectSchemaValidationValue<T extends object = Record<string, unknown>> = {
    [K in keyof T]-?: SchemaValidation<T[K]>["value"] | null;
};

/**
 * @public
 */
export type ObjectSchemaValidationFields<T extends object = Record<string, unknown>> = {
    readonly [K in keyof T]-?: SchemaValidation<T[K]>;
};

/**
 * @public
 */
export type ObjectSchemaValidationErrors<T extends object = Record<string, unknown>> =
    Iterable<string> & {
        readonly [K in keyof T]-?: SchemaValidation<T[K]>["errors"];
    };
