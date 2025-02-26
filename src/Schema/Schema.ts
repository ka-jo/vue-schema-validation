import { ValidationOptions } from "@/Types/ValidationOptions";
import { SchemaValidationError } from "./SchemaValidationError";

/**
 * Wrapper to allow implementing different schema validation libraries
 * @internal
 */
export abstract class Schema<T = unknown> {
    /**
     * Validate the data using the provided options
     *
     * @param data - Data to validate
     * @param options - Options to use for validation
     * @returns true if the data was valid
     * @throws a {@link SchemaValidationError} if the data was invalid
     */
    abstract validate(data: T, options: ValidationOptions): boolean;

    /**
     * Child properties of the schema.
     * @remarks
     * For object schemas, this will be an object with the same keys as the schema where each value is a {@link Schema}.
     * For array schemas, this will be an object with numeric keys where each value is a {@link Schema}.
     * For non-object schemas, this will be undefined
     */
    abstract readonly fields: SchemaFields<T>;

    /**
     * Default value for the schema
     */
    abstract readonly defaultValue?: Partial<T>;
}

export type SchemaFields<T> = T extends object
    ? {
          [P in keyof T]: Schema<T[P]>;
      }
    : undefined;
