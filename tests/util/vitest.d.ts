import "vitest";

interface CustomMatchers<R = unknown> {
    /**
     * Verify that the received value is a Vue ref by testin that Vue's isRef function returns true
     * when passed the received value.
     */
    toBeVueRef: () => R;
    /**
     * Veryify that the received value implements the iterable protocol.
     * @param expected - Optional array of values that should be present in the iterable. Does not verify the order of the values.
     * @remarks
     * If expected values are provided, the matcher will verify that the received value implements the iterable protocol,
     * that is the same number of elements, and that it contains all of the expected values, but in no particular order.
     * If no expected values are provided, the matcher will only verify that the received value implements the iterable protocol.
     */
    toBeIterable: (expected?: Array<unknown>) => R;
}

declare module "vitest" {
    interface Assertion<T = any> extends CustomMatchers<T> {}

    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
