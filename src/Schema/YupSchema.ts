import { ValidationOptions } from "@/Types/ValidationOptions";
import { Schema } from "./Schema";

export class YupSchema extends Schema {
    validate(options: ValidationOptions): boolean {
        throw new Error("Method not implemented.");
    }
}
