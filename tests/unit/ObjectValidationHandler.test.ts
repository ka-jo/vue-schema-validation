import { expect } from "vitest";

import { ref, isRef, Ref } from "vue";
import { anything, instance, mock, when } from "ts-mockito";

import { ObjectValidationHandler } from "@/ValidationHandler/ObjectValidationHandler";
import { Schema } from "@/Schema/Schema";

import { VALID_TEST_OBJECT, VALID_NESTED_OBJECT } from "tests/fixtures/valid-data";
import { DEFAULT_STRING, DEFAULT_TEST_OBJECT } from "tests/fixtures/default-data";
import { ValidationHandler } from "@/ValidationHandler/ValidationHandler";
import { SchemaValidationError } from "@/Schema/SchemaValidationError";
import { INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";

describe("ObjectValidationHandler", () => {
    let schemaMock: Schema<TestSchema>;

    beforeEach(() => {
        schemaMock = mock(Schema);
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class
        // so this test is only to test the typing
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            // @ts-expect-error
            handler.value = ref({});
        });

        it("should be a ref of an object containing all schema fields", () => {
            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema<string>,
                numberField: {} as Schema<number>,
                booleanField: {} as Schema<boolean>,
                objectField: {} as Schema<NestedObject>,
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.value.value).toEqual<TestSchema>({
                stringField: expect.any(String),
                numberField: expect.any(Number),
                booleanField: expect.any(Boolean),
                objectField: expect.any(Object),
            });
        });

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should initialize with schema default if no value provided", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = new ObjectValidationHandler(instance(schemaMock), {});

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class
        // But we should ensure the ref value is readonly
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});
            const originalErrors = handler.errors;
            const newErrors = ref([]);

            // @ts-expect-error
            handler.errors = newErrors;
            expect(handler.errors).toBe(originalErrors);
        });

        it("should be an object containing all schema fields", () => {
            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema<string>,
                numberField: {} as Schema<number>,
                booleanField: {} as Schema<boolean>,
                objectField: {} as Schema<NestedObject>,
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.errors).toEqual({
                stringField: expect.toBeIterable(),
                numberField: expect.toBeIterable(),
                booleanField: expect.toBeIterable(),
                objectField: expect.toBeIterable(),
            });
        });

        it("should be iterable for all field errors", () => {
            const requiredFieldSchemaMock = mock(Schema);
            when(requiredFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["requiredField"])
            );

            const optionalFieldSchemaMock = mock(Schema);
            when(optionalFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["optionalField"])
            );

            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema<string>,
                numberField: {} as Schema<number>,
                booleanField: {} as Schema<boolean>,
                objectField: {} as Schema<NestedObject>,
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {});
            const errors = Array.from(handler.errors.value);

            expect(handler.errors.value).toBeIterable();
            expect(errors).toEqual(["requiredField", "optionalField"]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class
        // But we should ensure the ref value is readonly
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});
            const originalIsValid = handler.isValid;
            const newIsValid = ref(false);

            // @ts-expect-error
            handler.isValid = newIsValid;
            expect(handler.isValid).toBe(originalIsValid);
        });

        it("should initialize to false", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });
    });

    describe("fields property", () => {
        it("should be an object containing all schema fields", () => {
            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema<string>,
                numberField: {} as Schema<number>,
                booleanField: {} as Schema<boolean>,
                objectField: {} as Schema<NestedObject>,
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.fields).toEqual({
                stringField: expect.any(ValidationHandler),
                numberField: expect.any(ValidationHandler),
                booleanField: expect.any(ValidationHandler),
                objectField: expect.any(ValidationHandler),
            });
        });

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            // @ts-expect-error
            handler.fields = {};
        });
    });

    describe("validate method", () => {
        it("should delegate to field validation", () => {
            const stringFieldSchemaMock = mock(Schema);
            when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);

            const numberFieldSchemaMock = mock(Schema);
            when(numberFieldSchemaMock.validate(anything(), anything())).thenReturn(true);

            const booleanFieldSchemaMock = mock(Schema);
            when(booleanFieldSchemaMock.validate(anything(), anything())).thenReturn(true);

            const objectFieldSchemaMock = mock(Schema);
            when(objectFieldSchemaMock.validate(anything(), anything())).thenReturn(true);

            when(schemaMock.fields).thenReturn({
                stringField: instance(stringFieldSchemaMock),
                numberField: instance(numberFieldSchemaMock),
                booleanField: instance(booleanFieldSchemaMock),
                objectField: instance(objectFieldSchemaMock),
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(schemaMock.validate).not.toHaveBeenCalled();

            expect(stringFieldSchemaMock.validate).toHaveBeenCalled();
            expect(numberFieldSchemaMock.validate).toHaveBeenCalled();
            expect(booleanFieldSchemaMock.validate).toHaveBeenCalled();
            expect(objectFieldSchemaMock.validate).toHaveBeenCalled();
        });

        describe("given valid data", () => {
            beforeEach(() => {
                when(schemaMock.validate(VALID_TEST_OBJECT, anything())).thenReturn(true);
            });

            it("should return true", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();
                const errors = Array.from(handler.errors.value);

                expect(errors).toHaveLength(0);
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(schemaMock.validate(INVALID_TEST_OBJECT, anything())).thenThrow();
            });

            it("should return false", () => {});

            it("should set isValid to false", () => {});

            it("should populate errors", () => {});
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {});
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {});

            it("should reset handler value to schema default if no initial value", () => {});
        });

        it("should set isValid to false", () => {});

        it("should reset errors", () => {});
    });
});
