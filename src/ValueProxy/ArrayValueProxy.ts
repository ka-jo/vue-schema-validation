import { isRef, markRaw, Ref } from "vue";
import { Handler, isSchemaValidation } from "../common";

const ArrayProxyHooks = Symbol("ArrayProxyHooks");

export const Raw = Symbol("Raw");

/**
 * @internal
 */
export class ArrayProxy<T = unknown> extends Array<T> {
    [ArrayProxyHooks]: ArrayProxyHooks<T>;
    [Raw]: Array<Ref<T>>;

    constructor(array: Array<Ref<T>>, hooks: ArrayProxyHooks<T>) {
        super(array.length);
        for (let i = 0; i < array.length; i++) {
            //@ts-expect-error: To a consumer, this should like a normal array, but it actually is an array of refs
            this[i] = array[i];
        }
        this[ArrayProxyHooks] = hooks;
        //@ts-expect-error
        this[Raw] = this;
        return markRaw(new Proxy(this, ARRAY_PROXY_HANDLER));
    }

    push(...args: Array<T>): number {
        const result = super.push.call(this, ...args);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    pop(): T | undefined {
        const result = super.pop.call(this);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    shift(): T | undefined {
        const result = super.shift.call(this);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    unshift(...args: Array<T>): number {
        const result = super.unshift.call(this, ...args);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    splice(start: number, deleteCount: number, ...items: Array<T>): Array<T> {
        const result = super.splice.call(this, start, deleteCount, ...items);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    reverse(): Array<T> {
        const result = super.reverse.call(this);
        this[ArrayProxyHooks].onUpdate?.(this);
        return result;
    }

    sort(compareFn?: (a: T, b: T) => number): this {
        super.sort.call(this, compareFn);
        this[ArrayProxyHooks].onUpdate?.(this);
        return this;
    }

    fill(value: T, start?: number, end?: number): this {
        super.fill.call(this, value, start, end);
        this[ArrayProxyHooks].onUpdate?.(this);
        return this;
    }

    copyWithin(target: number, start: number, end?: number): this {
        super.copyWithin.call(this, target, start, end);
        this[ArrayProxyHooks].onUpdate?.(this);
        return this;
    }
}

const arrayProps = new Set<PropertyKey>(Object.getOwnPropertyNames(Array.prototype));
arrayProps.delete("length");

const ARRAY_PROXY_HANDLER: ProxyHandler<ArrayProxy<any>> = {
    get(target: ArrayProxy, p: PropertyKey): any {
        const result = Reflect.get(target[Raw], p);
        return isRef(result) ? result.value : result;
    },
    set(target: ArrayProxy, key: PropertyKey, value: unknown): boolean {
        if (arrayProps.has(key)) {
            return false;
        }
        if (
            !isNaN((key = Number(key))) &&
            target[ArrayProxyHooks].onFieldUpdate?.(key, value) !== false
        ) {
            target[Raw][key].value = value;
        }
        return true;
    },
};

/**
 * @internal
 */
export type ArrayUpdateHook<T = unknown> = (val: Array<T>) => void;

/**
 * @internal
 */
export type ArrayFieldUpdateHook<T = unknown> = (index: number, val: T) => boolean;

/**
 * @internal
 */
export type ArrayProxyHooks<T = unknown> = {
    onUpdate?: ArrayUpdateHook<T>;
    onFieldUpdate?: ArrayFieldUpdateHook<T>;
};
