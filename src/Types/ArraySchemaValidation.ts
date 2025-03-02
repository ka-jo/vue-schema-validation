import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";

/**
 * @public
 */
export interface ArraySchemaValidation<T extends Array<unknown> = Array<unknown>>
    extends ISchemaValidation<T> {
    fields: ArraySchemaValidationFields<T>;
    errors: ArraySchemaValidationErrors<T>;

    reset(value?: T): void;
}

/**
 * @privateRemarks
 * Because the generic is constrained to an array, this will never resolve to `never`
 * This is how you infer the type of array elements with TypeScript 🤷‍♂️
 * @public
 */
export type ArraySchemaValidationFields<T extends Array<unknown>> = T extends Array<infer U>
    ? Record<number, SchemaValidation<U>>
    : never;

/**
 * @public
 */
export type ArraySchemaValidationErrors<T extends Array<unknown>> = Iterable<string> & {
    [K in keyof T]-?: SchemaValidation<T[K]>["errors"];
};
