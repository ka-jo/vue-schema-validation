import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { TupleValidationHandler } from "@/ValidationHandler/TupleValidationHandler";
import { Handler } from "@/common";
import { Tuple } from "./util";
import { ValidationHandler } from "@/ValidationHandler";

export interface TupleSchemaValidation<T extends Array<unknown> = Array<unknown>>
    extends ISchemaValidation {
    /**
     * @internal
     */
    readonly [Handler]: ValidationHandler<T>;
    get value(): T;
    set value(value: Partial<T>);
    readonly fields: TupleSchemaValidationFields<T>;
    readonly errors: TupleSchemaValidationErrors<T>;

    reset(value?: Partial<T>): void;
}

/**
 * @public
 */
export type TupleSchemaValidationFields<T extends Array<unknown> = Array<unknown>> = {
    readonly [i in keyof T]: SchemaValidation<T[i]>;
};

/**
 * @public
 * @privateRemarks
 * This a weird type, but the use of Omit ensures that the mapped type doesn't include properties from Array.
 * Without it, the resulting type would be expected to be an array, as mapping over an array results in an array.
 */
export type TupleSchemaValidationErrors<T extends Array<unknown> = Array<unknown>> =
    Iterable<string> & { readonly $root: ReadonlyArray<string> } & {
        readonly [K in keyof Omit<T, keyof any[]>]: SchemaValidation<T[K]>["errors"];
    };
