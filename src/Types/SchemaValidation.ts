import { ArraySchemaValidation } from "@/Types/ArraySchemaValidation";
import { ObjectSchemaValidation } from "@/Types/ObjectSchemaValidation";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";

/**
 * @public
 */
export type SchemaValidation<T = unknown> = T extends Array<any>
    ? ArraySchemaValidation<T>
    : T extends object
    ? ObjectSchemaValidation<T>
    : PrimitiveSchemaValidation<T>;

/**
 * The base validation interface representing the schema validation as used by the consumer
 * @remarks
 * This interface was only created to be used when defining the specific validation interfaces
 * (i.e. {@link PrimitiveSchemaValidation}, {@link ObjectSchemaValidation}, and {@link ArraySchemaValidation})
 * You should not use this interface directly, but instead prefer the specific validation interfaces
 * or the {@link Validation} type when you don't already know the specific type of validation
 * @public
 */
export interface ISchemaValidation<T> {
    value: T;
    errors: Iterable<string>;
    isValid: boolean;

    validate(): boolean;
    reset(value?: T): void;
}
