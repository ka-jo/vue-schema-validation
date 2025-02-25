/**
 * Error thrown by Schema implementations when the data is invalid
 * @internal
 */
export class SchemaValidationError extends AggregateError {
    name = "SchemaValidationError";
    errors: string[];

    constructor(errors: string[]) {
        super(errors);
        this.errors = errors;
    }
}
