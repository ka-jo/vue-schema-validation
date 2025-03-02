import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { ElementType } from "./util";

/**
 * @public
 */
export interface ArraySchemaValidation<T extends Array<unknown> = Array<unknown>>
    extends ISchemaValidation<T> {
    readonly fields: ArraySchemaValidationFields<T>;
    readonly errors: ArraySchemaValidationErrors<T>;

    reset(value?: T): void;
}

/**
 * @privateRemarks
 * Because the generic is constrained to an array, this will never resolve to `never`
 * This is how you infer the type of array elements with TypeScript 🤷‍♂️
 * @public
 */
export type ArraySchemaValidationFields<T extends Array<unknown>> = {
    readonly [i: number]: SchemaValidation<ElementType<T>>;
};

/**
 * @public
 */
export type ArraySchemaValidationErrors<T extends Array<unknown>> = Iterable<string> & {
    readonly [i: number]: SchemaValidation<ElementType<T>>["errors"];
};
