import { anything, instance, mock, when } from "ts-mockito";

import { PrimitiveValidationHandler } from "@/ValidationHandler/PrimitiveValidationHandler";
import { Schema } from "@/Schema/Schema";
import { SchemaValidationError } from "@/Schema/SchemaValidationError";

import { VALID_STRING } from "tests/fixtures/valid-data";
import { DEFAULT_STRING } from "tests/fixtures/default-data";
import { INVALID_STRING } from "tests/fixtures/invalid-data";

describe("PrimitiveValidationHandler", () => {
    let schemaMock: Schema<"primitive">;

    beforeEach(() => {
        schemaMock = mock(Schema);
    });

    describe("value property", () => {
        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class.
        // So we'll just ensure the property is typed as readonly.
        it("should be readonly", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});
            // @ts-expect-error
            handler.value = ref("");
        });

        it("should be a Vue ref", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: VALID_STRING,
                });

                expect(handler.value.value).toBe(VALID_STRING);
            });

            it("should initialize with schema default if no value provided", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

                expect(handler.value.value).toBe(DEFAULT_STRING);
            });

            it("should initialize with null if no value provided and no schema default", () => {
                when(schemaMock.defaultValue).thenReturn(undefined);
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

                expect(handler.value.value).toBeNull();
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class.
        // So we'll ensure the property is typed as readonly and that the Vue ref is readonly.
        it("should be readonly", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});
            const originalErrors = handler.errors.value;
            const newErrors = {} as any;

            // @ts-expect-error
            handler.errors.value = newErrors;

            type Errors = Pick<PrimitiveValidationHandler, "errors">;

            expectTypeOf<Errors>().toEqualTypeOf<{
                readonly errors: PrimitiveValidationHandler["errors"];
            }>();

            expect(handler.errors.value).toBe(originalErrors);
        });

        it("should be iterable", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable();
        });

        it("should initialize as an empty iterable", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        it("should be readonly", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});
            const originalIsValid = handler.isValid.value;
            const newIsValid = !originalIsValid;

            // @ts-expect-error
            handler.isValid.value = newIsValid;

            type IsValid = Pick<PrimitiveValidationHandler, "isValid">;

            expectTypeOf<IsValid>().toEqualTypeOf<{
                readonly isValid: PrimitiveValidationHandler["isValid"];
            }>();

            expect(handler.isValid.value).toBe(originalIsValid);
        });

        it("should initialize to false", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });
    });

    describe("fields property", () => {
        it("should be undefined", () => {
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            expect(handler.fields).toBeUndefined();
        });
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            beforeEach(() => {
                when(schemaMock.validate(VALID_STRING, anything())).thenReturn(true);
            });

            it("should return true", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: VALID_STRING,
                });

                const result = handler.validate();

                expect(result).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: VALID_STRING,
                });

                expect(handler.isValid.value).toBe(false);

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: VALID_STRING,
                });

                handler.validate();

                expect(handler.errors.value).toBeIterable([]);
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(schemaMock.validate(INVALID_STRING, anything())).thenThrow(
                    new SchemaValidationError(["invalid string"])
                );
            });

            it("should return false", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: INVALID_STRING,
                });

                const result = handler.validate();

                expect(result).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: INVALID_STRING,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: INVALID_STRING,
                });

                handler.validate();

                expect(handler.errors.value).toBeIterable(["invalid string"]);
            });
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: DEFAULT_STRING,
                });

                handler.reset(VALID_STRING);

                expect(handler.value.value).toBe(VALID_STRING);
            });
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                    value: VALID_STRING,
                });

                handler.value.value = INVALID_STRING;

                expect(handler.value.value).toBe(INVALID_STRING);

                handler.reset();

                expect(handler.value.value).toBe(VALID_STRING);
            });

            it("should reset handler value to schema default if no initial value", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

                handler.reset();

                expect(handler.value.value).toBe(DEFAULT_STRING);
            });
        });

        it("should set isValid to false", () => {
            when(schemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {
                value: VALID_STRING,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);

            handler.reset();

            expect(handler.isValid.value).toBe(false);
        });

        it("should reset errors", () => {
            when(schemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["invalid string"])
            );
            const handler = new PrimitiveValidationHandler(instance(schemaMock), {});

            handler.validate();

            expect(handler.errors.value).toBeIterable(["invalid string"]);

            handler.reset();

            expect(handler.errors.value).toBeIterable([]);
        });
    });
});
