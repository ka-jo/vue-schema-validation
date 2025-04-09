import { SchemaValidation } from "@/Types/SchemaValidation";
import { Handler } from "@/common";

export function tearDown(validation: SchemaValidation) {
    validation[Handler].tearDown();
}
