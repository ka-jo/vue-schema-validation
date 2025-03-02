import { ISchemaValidation } from "@/Types/SchemaValidation";

/**
 * Represents validation for a single value
 * @remarks
 * We use the term "primitive" here loosely. Primitive in this case means any schema type that represents
 * a single value, but is not necessarily a JavaScript primitive type. For example, a schema that represents
 * a date value would be considered a "primitive" schema, even though Date is not a JavaScript primitive type.
 * @privateRemarks
 * It may seem odd to have both this interface and the {@link ISchemaValidation} interface, but this interface
 * can be used expose TSDoc comments specific to primitive schemas, and it continues the pattern seen in the
 * rest of the codebase when it comes to file structure and inheritance.
 * @public
 */
export interface PrimitiveSchemaValidation<T = unknown> extends ISchemaValidation<T> {}
