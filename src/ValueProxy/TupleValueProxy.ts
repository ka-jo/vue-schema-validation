import { isSchemaValidation } from "@/common";
import { SchemaValidation } from "@/Types/SchemaValidation";
import { TupleValidationHandler } from "@/ValidationHandler";

const Handler: unique symbol = Symbol("Handler");
const Raw: unique symbol = Symbol("Raw");

/**
 * @internal
 */
export class TupleValueProxy extends Array {
    [Handler]: TupleValidationHandler;
    [Raw]: Array<SchemaValidation>;

    constructor(handler: TupleValidationHandler) {
        super(handler.fields.length);
        for (let i = 0; i < handler.fields.length; i++) {
            this[i] = handler.fields[i];
        }
        this[Handler] = handler;
        this[Raw] = this as Array<SchemaValidation>;
        return new Proxy(this, TUPLE_PROXY_HANDLER);
    }

    push(): number {
        return this.length;
    }

    pop(): unknown | undefined {
        const field = this[Raw].at(-1)!;
        const result = field.value;
        field.value = undefined;
        return result;
    }

    shift(): unknown | undefined {
        const fields = this[Raw];
        const result = fields.at(0)?.value;
        for (let i = 0; i < fields.length; i++) {
            const field = fields.at(i)!;
            field.value = this[Raw].at(i + 1)?.value;
        }
        return result;
    }

    unshift(...args: Array<unknown>): number {
        const fields = this[Raw];
        for (let i = fields.length - 1; i >= 0; i--) {
            fields[i].value = args[i] ?? fields[i - 1]?.value;
        }
        return this.length;
    }

    splice(start: number, deleteCount: number, ...items: Array<unknown>): Array<unknown> {
        const clone = Array.from(this[Raw], (field) => field.value);
        const result = clone.splice(start, deleteCount, ...items);
        this[Handler].setValue(clone);
        return result;
    }

    reverse(): Array<unknown> {
        const clone = [];
        for (let i = this.length - 1; i >= 0; i--) {
            clone.push(this[i]);
        }
        this[Handler].setValue(clone);
        return this;
    }

    sort(compareFn?: (a: unknown, b: unknown) => number): this {
        const clone = Array.from(this[Raw], (field) => field.value);
        clone.sort(compareFn);
        this[Handler].setValue(clone);
        return this;
    }

    fill(value: unknown, start: number = 0, end: number = this.length): this {
        if (start < 0) start = start < -this.length ? 0 : this.length + start;
        else if (start >= this.length) return this;

        if (end < 0) end = end < -this.length ? 0 : this.length + end;
        else if (end > this.length) end = this.length;
        else if (end < start) return this;

        for (let i = start; i < end; i++) {
            this[Raw][i].value = value;
        }
        return this;
    }

    copyWithin(target: number, start: number, end?: number): this {
        const clone = Array.from(this[Raw], (field) => field.value);
        clone.copyWithin(target, start, end);
        this[Handler].setValue(clone);
        return this;
    }
}

const arrayProps = new Set<PropertyKey>(Object.getOwnPropertyNames(Array.prototype));

const TUPLE_PROXY_HANDLER: ProxyHandler<TupleValueProxy> = {
    get(target, prop) {
        let result = Reflect.get(target, prop);
        if (isSchemaValidation(result)) {
            result = result.value;
        }
        return result;
    },
    set(target, prop, value) {
        if (arrayProps.has(prop)) {
            if (prop === "length") {
                return target[Handler].setLength(value), true;
            }
            return false;
        }
        return target[Handler].setFieldValue(Number(prop), value), true;
    },
};
