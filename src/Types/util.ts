import { Test } from "vitest";
import { Ref } from "vue";

/**
 * Convenvience type for a Vue ref for which the value can never be set (e.g. a computed ref)
 * @public
 */
export type ReadonlyRef<T = unknown> = Ref<T, never>;

/**
 * A deep partial type that allows for partial values of nested objects
 * @public
 */
export type DeepPartial<T extends object> = {
    [P in keyof T]?: NonNullable<T[P]> extends object
        ? DeepPartial<NonNullable<T[P]>> | null
        : T[P] | null;
};

/**
 * Infers the element type of an array
 * @privateRemarks
 * Because the generic is constrained to an array, this will never resolve to `never`
 * This is how you infer the type of array elements with TypeScript 🤷‍♂️
 * @public
 */
export type ElementType<T extends Array<unknown>> = T extends Array<infer U> ? U : never;

/**
 * A plain old JavaScript object
 * @privateRemarks
 * It's unfortunate, but typing is just easier everywhere if we use `Record<string, any>` instead of `Record<string, unknown>`
 * @public
 */
export type POJO = Record<string, any>;

/**
 * A type that removes readonly from all properties of an object
 * @internal
 */
export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Tuple = [...unknown[]] & { length: 1 };
