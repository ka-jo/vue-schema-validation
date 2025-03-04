import { Schema } from "yup";

/**
 * Options for validation
 * @public
 */
export type ValidationOptions<T = unknown> = {
    /**
     * Schema to use for validation. As of now, only Yup schemas are supported
     * @public
     */
    schema: Schema<T>;

    /**
     * Return from validation after first error is encountered rather after all validations are run
     * @defaultValue false
     * @public
     */
    abortEarly?: boolean;

    /**
     * Initial value to use for validation. If not provided, the default value of the schema will be used
     * @remarks
     * When validating object schemas, you can provide a partial object and any missing properties
     * will be initialized using the default value for that property's schema. If no default value
     * exists and no initial value is provided, the property will be initialized as null
     * @public
     */
    value?: T extends Array<any>
        ? T
        : T extends object
        ? Partial<T>
        : unknown extends T
        ? unknown
        : T;

    /**
     * State that isn't part of the validated data but is needed by the schema for validation
     * @remarks
     * As an example, this could be used to differentiate between create and update operations
     * @public
     */
    context?: unknown;
};
