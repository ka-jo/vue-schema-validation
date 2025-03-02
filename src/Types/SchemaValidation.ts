import { ArraySchemaValidation } from "@/Types/ArraySchemaValidation";
import { ObjectSchemaValidation } from "@/Types/ObjectSchemaValidation";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";

/**
 * @privateRemarks
 * As much as I would prefer to not use the ISchemaValidation interface in this type,
 * if we are to support the use of a readonly array as errors for primitive schemas,
 * we must default to using ISchemaValidation when we don't already know the type
 * because ObjectSchemaValidation and ArraySchemaValidation errors are not arrays
 * @public
 */
export type SchemaValidation<T = unknown> = T extends Array<any>
    ? ArraySchemaValidation<T>
    : T extends object
    ? ObjectSchemaValidation<T>
    : T extends unknown
    ? ISchemaValidation<T>
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
