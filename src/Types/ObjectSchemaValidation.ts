import { HandlerInstance } from "@/common";
import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { DeepPartial, POJO } from "@/Types/util";
import { ValidationHandler } from "@/ValidationHandler";

/**
 * @public
 */
export interface ObjectSchemaValidation<T extends object = POJO> extends ISchemaValidation {
    /**
     * @internal
     */
    readonly [HandlerInstance]: ValidationHandler<T>;

    get value(): ObjectSchemaValidationValue<T>;
    set value(value: DeepPartial<T>);

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
export type ObjectSchemaValidationValue<T extends object = POJO> = {
    [K in keyof T]-?: SchemaValidation<NonNullable<T[K]>>["value"];
};

/**
 * @public
 */
export type ObjectSchemaValidationFields<T extends object = POJO> = {
    readonly [K in keyof T]-?: SchemaValidation<NonNullable<T[K]>>;
};

/**
 * @public
 */
export type ObjectSchemaValidationErrors<T extends object = POJO> = Iterable<string> & {
    readonly $root: ReadonlyArray<string>;
} & {
    readonly [K in keyof T]-?: SchemaValidation<NonNullable<T[K]>>["errors"];
};
