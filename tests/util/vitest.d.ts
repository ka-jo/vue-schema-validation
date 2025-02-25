import "vitest";

interface CustomMatchers<R = unknown> {
    toBeVueRef: () => R;
    toBeIterable: () => R;
}

declare module "vitest" {
    interface Assertion<T = any> extends CustomMatchers<T> {}

    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
