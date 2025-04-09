import type { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import type { ElementType } from "@/Types/util";
import type { ValidationHandler } from "@/ValidationHandler";
import type { Handler } from "@/common";

/**
 * @public
 */
export interface ArraySchemaValidation<T extends Array<unknown> = Array<unknown>>
    extends ISchemaValidation {
    /**
     * @internal
     */
    readonly [Handler]: ValidationHandler<T>;
    value: T;
    readonly fields: ReadonlyArray<SchemaValidation<ElementType<T>>>;
    readonly errors: ArraySchemaValidationErrors<T>;

    reset(value?: T): void;
}

/**
 * @public
 */
export type ArraySchemaValidationErrors<T extends Array<unknown> = Array<unknown>> =
    Iterable<string> & {
        readonly $root: ReadonlyArray<string>;
    } & {
        readonly [i: number]: SchemaValidation<ElementType<T>>["errors"];
    };
