import "vitest";
import { ISchemaValidation } from "@/Types/SchemaValidation";

interface CustomMatchers<R = unknown> {
    /**
     * Verify that the received value is a Vue ref by testin that Vue's isRef function returns true
     * when passed the received value.
     */
    toBeVueRef: () => R;
    /**
     * Verify that the received value is a reactive Vue proxy by testing that Vue's isReactive function returns true
     * when passed the received value.
     */
    toBeReactive: () => R;
    /**
     * Verify that the received value implements the iterable protocol.
     * @param expected - Optional array of values that should be present in the iterable. Does not verify the order of the values.
     * @remarks
     * If expected values are provided, the matcher will verify that the received value implements the iterable protocol,
     * that is the same number of elements, and that it contains all of the expected values, but in no particular order.
     * If no expected values are provided, the matcher will only verify that the received value implements the iterable protocol.
     */
    toBeIterable: (expected?: Array<unknown>) => R;
    /**
     * Verify that the received value has all values defined on the {@link ISchemaValidation} interface.
     * @param expectedValueType - Optional Constructor type to check the value property against.
     * @remarks
     * This only verifies that fields property is an object if the expectedValueType param is Object. Otherwise it expects fields to be undefined.
     * If verifying a schema validation object for an object schema, ensure to pass Object as the expectedValueType.
     * This does not verify the structure of the fields property in such a case — only that it is an object.
     */
    toBeSchemaValidation: (expectedValueType?: unknown) => R;
}

declare module "vitest" {
    interface Assertion<T = any> extends CustomMatchers<T> {}

    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
