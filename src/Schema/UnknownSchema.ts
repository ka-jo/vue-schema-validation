import { Schema } from "@/Schema";

export class UnknownSchema extends Schema<"unknown"> {
    constructor() {
        super("unknown", undefined, undefined);
    }

    validate() {
        return true;
    }
}
