import { Handler } from "@/common";
import { ArraySchemaValidation } from "@/Types/ArraySchemaValidation";
import { ObjectSchemaValidation } from "@/Types/ObjectSchemaValidation";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import { TupleSchemaValidation } from "@/Types/TupleSchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";

/**
 * @privateRemarks
 * As much as I would prefer to not use the ISchemaValidation interface in this type,
 * if we are to support the use of a readonly array as errors for primitive schemas,
 * we must default to using ISchemaValidation when we don't already know the type
 * because ObjectSchemaValidation and ArraySchemaValidation errors are not arrays
 * @public
 */
export type SchemaValidation<T = unknown> = T extends Array<any>
    ? // A tuple will have a fixed length and so the type of its length property will be a specific number
      // If the length property is of type `number`, then it's not fixed length and therefore not a tuple
      number extends T["length"]
        ? ArraySchemaValidation<T>
        : TupleSchemaValidation<T>
    : T extends object
    ? ObjectSchemaValidation<T>
    : unknown extends T
    ? ISchemaValidation
    : PrimitiveSchemaValidation<T>;

/**
 * The base validation interface representing the schema validation as used by the consumer
 * @remarks
 * This interface was only created to be used when defining the specific validation interfaces
 * (i.e. {@link PrimitiveSchemaValidation}, {@link ObjectSchemaValidation}, and {@link ArraySchemaValidation})
 * You should not use this interface directly, but instead prefer the specific validation interfaces
 * or the {@link SchemaValidation} type when you don't already know the specific type of validation
 * @privateRemarks
 * This interface lays out the structure that all type specific validation interfaces must follow.
 * It should always represent a completely unknown type, so there should never be a need for a
 * type parameter on this interface.
 * @public
 */
export interface ISchemaValidation {
    /**
     * A reference to the {@link ValidationHandler} instance that is managing the validation
     * @internal
     */
    readonly [Handler]: ValidationHandler<unknown>;

    value: unknown;
    readonly errors: Iterable<string>;
    readonly fields?: unknown;
    readonly isValid: boolean;
    readonly isDirty: boolean;

    validate(): boolean;
    reset(value?: unknown): void;
}
