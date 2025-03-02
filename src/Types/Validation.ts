import { DeepPartial } from "./util";

/**
 * @public
 */
export type Validation<T = unknown> = T extends Array<any>
    ? ArrayValidation<T>
    : T extends object
    ? ObjectValidation<T>
    : BaseValidation<T>;

/**
 * @public
 */
export interface BaseValidation<T = unknown> {
    value: T;
    errors: Iterable<string>;
    isValid: boolean;

    validate(): boolean;
    reset(value?: T): void;
}

/**
 * @public
 */
export interface ObjectValidation<T extends object> extends BaseValidation<T> {
    fields: Record<string, BaseValidation>;
    errors: Record<string, Iterable<string>> & Iterable<string>;

    reset(value?: DeepPartial<T>): void;
}

/**
 * @public
 */
export interface ArrayValidation<T extends Array<any>> extends BaseValidation<T> {
    fields: Record<number, BaseValidation>;
    errors: Record<number, Iterable<string>> & Iterable<string>;
}
