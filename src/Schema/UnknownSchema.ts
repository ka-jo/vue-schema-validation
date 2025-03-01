import { Schema } from "@/Schema/Schema";

export class UnknownSchema extends Schema<"unknown"> {
    fields: undefined;
    defaultValue: undefined;

    constructor() {
        super("unknown");
    }

    validate() {
        return true;
    }
}
