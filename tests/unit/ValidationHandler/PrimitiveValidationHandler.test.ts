import { anything, instance, mock, when } from "ts-mockito";
import { PrimitiveValidationHandler } from "@/ValidationHandler/PrimitiveValidationHandler";
import { Schema } from "@/Schema/Schema";
import { SchemaValidationError } from "@/Schema/SchemaValidationError";

import { VALID_STRING } from "tests/fixtures/valid-data";
import { DEFAULT_STRING } from "tests/fixtures/default-data";
import { INVALID_STRING } from "tests/fixtures/invalid-data";
import { HandlerInstance } from "@/common";

describe("PrimitiveValidationHandler", () => {
    let schemaMock: Schema<"primitive">;

    beforeEach(() => {
        schemaMock = mock<Schema<"primitive">>();
    });

    describe("value property", () => {
        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class.
        // So we'll just ensure the property is typed as readonly.
        it("should be readonly", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});
            // @ts-expect-error
            handler.value = {} as any;
        });

        it("should be a Vue ref", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: VALID_STRING,
                });

                expect(handler.value.value).toBe(VALID_STRING);
            });

            it("should initialize with schema default if no value provided", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                expect(handler.value.value).toBe(DEFAULT_STRING);
            });

            it("should initialize with null if no value provided and no schema default", () => {
                when(schemaMock.defaultValue).thenReturn(undefined);
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                expect(handler.value.value).toBeNull();
            });
        });

        describe("assignment", () => {
            it("should use the value when given a defined value", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                handler.value.value = "new string";

                expect(handler.value.value).toBe("new string");
            });

            it("should use schema default when given undefined", () => {
                when(schemaMock.defaultValue).thenReturn("some default");
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                handler.value.value = undefined;

                expect(handler.value.value).toBe("some default");
            });

            // My thinking is that if the consumer explicitly passes null, they're probably trying to clear the value,
            // so we should respect that. If they wanted the default, they would have passed undefined.
            it("should use null when given null", () => {
                when(schemaMock.defaultValue).thenReturn("some default");
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                handler.value.value = null;

                expect(handler.value.value).toBeNull();
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class.
        // So we'll ensure the property is typed as readonly
        it("should be readonly", () => {
            expectTypeOf<PrimitiveValidationHandler>().pick("errors").toEqualTypeOf<{
                readonly errors: PrimitiveValidationHandler["errors"];
            }>();
        });

        it("should be iterable", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable();
        });

        it("should initialize as an empty iterable", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        it("should be readonly", () => {
            expectTypeOf<PrimitiveValidationHandler>().pick("isValid").toEqualTypeOf<{
                readonly isValid: PrimitiveValidationHandler["isValid"];
            }>();
        });

        it("should initialize to false", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });
    });

    describe("fields property", () => {
        it("should be undefined", () => {
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            expect(handler.fields).toBeUndefined();
        });
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            beforeEach(() => {
                when(schemaMock.validate(VALID_STRING, anything())).thenReturn(true);
            });

            it("should return true", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: VALID_STRING,
                });

                const result = handler.validate();

                expect(result).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: VALID_STRING,
                });

                expect(handler.isValid.value).toBe(false);

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
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
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: INVALID_STRING,
                });

                const result = handler.validate();

                expect(result).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: INVALID_STRING,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
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
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: DEFAULT_STRING,
                });

                handler.reset(VALID_STRING);

                expect(handler.value.value).toBe(VALID_STRING);
            });
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
                    value: VALID_STRING,
                });

                handler.value.value = INVALID_STRING;

                expect(handler.value.value).toBe(INVALID_STRING);

                handler.reset();

                expect(handler.value.value).toBe(VALID_STRING);
            });

            it("should reset handler value to schema default if no initial value", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                handler.reset();

                expect(handler.value.value).toBe(DEFAULT_STRING);
            });
        });

        it("should set isValid to false", () => {
            when(schemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {
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
            const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

            handler.validate();

            expect(handler.errors.value).toBeIterable(["invalid string"]);

            handler.reset();

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("toReactive method", () => {
        describe("return value", () => {
            it("should be an object", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeTypeOf("object");
            });

            it("should be reactive", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeReactive();
            });

            it("should have HandlerInstance symbol property", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive[HandlerInstance]).toBeInstanceOf(PrimitiveValidationHandler);
            });

            it("should have value property", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toHaveProperty("value");
                expect(reactive.value).toEqual(handler.value.value);
            });

            it("should have readonly errors property", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toHaveProperty("errors");
                expect(reactive.errors).toEqual(handler.errors.value);
                expect(() => {
                    //@ts-expect-error
                    reactive.errors = ["new error"];
                }).toThrowError();
            });

            it("should not have fields property", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).not.toHaveProperty("fields");
            });

            it("should have readonly isValid property", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toHaveProperty("isValid");
                expect(reactive.isValid).toBe(handler.isValid.value);
                expect(() => {
                    //@ts-expect-error
                    reactive.isValid = !handler.isValid.value;
                }).toThrowError();
            });

            it("should have validate method", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive.validate).toBeInstanceOf(Function);
            });

            it("should have reset method", () => {
                const handler = PrimitiveValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive.reset).toBeInstanceOf(Function);
            });
        });
    });
});
