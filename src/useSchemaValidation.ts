import { ValidationOptions } from "@/Types/ValidationOptions";
import { SchemaValidation } from "@/Types/SchemaValidation";
import { Schema } from "@/Schema";
import { ValidationHandler } from "@/ValidationHandler";

export function useSchemaValidation<T>(options: ValidationOptions<T>): SchemaValidation<T> {
    const schema = Schema.create(options.schema);
    const handler = ValidationHandler.create(schema, options);

    return handler.toReactive() as SchemaValidation<T>;
}
