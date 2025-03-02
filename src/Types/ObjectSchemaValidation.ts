import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { DeepPartial } from "@/Types/util";

/**
 * @public
 */
export interface ObjectSchemaValidation<T extends object = Record<string, unknown>>
    extends ISchemaValidation<T> {
    fields: ObjectSchemaValidationFields<T>;
    errors: ObjectSchemaValidationErrors<T>;

    reset(value?: DeepPartial<T>): void;
}

/**
 * @public
 */
export type ObjectSchemaValidationFields<T extends object = Record<string, unknown>> = {
    [K in keyof T]-?: SchemaValidation<T[K]>;
};

/**
 * @public
 */
export type ObjectSchemaValidationErrors<T extends object = Record<string, unknown>> =
    Iterable<string> & {
        [K in keyof T]-?: SchemaValidation<T[K]>["errors"];
    };
