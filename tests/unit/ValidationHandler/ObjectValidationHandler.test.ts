import { expect } from "vitest";
import { anything, instance, mock, verify, when } from "ts-mockito";

import { ValidationHandler, ObjectValidationHandler } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";

import { VALID_TEST_OBJECT, VALID_NESTED_OBJECT } from "tests/fixtures/valid-data";
import { DEFAULT_TEST_OBJECT } from "tests/fixtures/default-data";
import { INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";

describe("ObjectValidationHandler", () => {
    let schemaMock: Schema<"object">;

    beforeEach(() => {
        schemaMock = mock(Schema);
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class.
        // So we'll just ensure the property is typed as readonly.
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            // @ts-expect-error
            handler.value = ref({});
        });

        it("should be an object containing all schema fields", () => {
            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema<"primitive">,
                numberField: {} as Schema<"primitive">,
                booleanField: {} as Schema<"primitive">,
                objectField: {} as Schema<"object">,
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

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class.
        // So we'll ensure the property is typed as readonly and that the Vue ref is readonly.
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});
            const originalErrors = handler.errors.value;
            const newErrors = {} as any;

            // @ts-expect-error
            handler.errors.value = newErrors;

            type Errors = Pick<ObjectValidationHandler, "errors">;

            // This is a dumb way to ensure nobody removes the readonly from the class isn't it?  ¯\_(ツ)_/¯
            expectTypeOf<Errors>().toEqualTypeOf<{
                readonly errors: ObjectValidationHandler["errors"];
            }>();

            expect(handler.errors).toBe(originalErrors);
        });

        it("should be an object containing all schema fields", () => {
            when(schemaMock.fields).thenReturn({
                stringField: {} as Schema,
                numberField: {} as Schema,
                booleanField: {} as Schema,
                objectField: {} as Schema,
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
                stringField: {} as Schema,
                numberField: {} as Schema,
                booleanField: {} as Schema,
                objectField: {} as Schema,
            });

            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable(["requiredField", "optionalField"]);
        });

        it("should initialize as an empty iterable", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class.
        // So we'll ensure the property is typed as readonly and that the Vue ref is readonly.
        it("should be readonly", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {});
            const originalIsValid = handler.isValid.value;
            const newIsValid = !originalIsValid;

            // @ts-expect-error
            handler.isValid.value = newIsValid;

            type IsValid = Pick<ObjectValidationHandler, "isValid">;

            expectTypeOf<IsValid>().toEqualTypeOf<{
                readonly isValid: ObjectValidationHandler["isValid"];
            }>();

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
                stringField: {} as Schema,
                numberField: {} as Schema,
                booleanField: {} as Schema,
                objectField: {} as Schema,
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
        // I'm a little iffy on validating the child schemas here because it skips the fact
        // that the child ValidationHandler should first be called, but I don't want to mock
        // the child ValidationHandlers because that would mean mocking an internal of the test subject.
        // Maybe in the future, the ObjectValidationHandler constructor could take a record of ValidationHandlers
        // instead of building it itself?
        let stringFieldSchemaMock: Schema;
        let numberFieldSchemaMock: Schema;
        let booleanFieldSchemaMock: Schema;
        let objectFieldSchemaMock: Schema;

        beforeEach(() => {
            stringFieldSchemaMock = mock(Schema);
            numberFieldSchemaMock = mock(Schema);
            booleanFieldSchemaMock = mock(Schema);
            objectFieldSchemaMock = mock(Schema);

            when(schemaMock.fields).thenReturn({
                stringField: instance(stringFieldSchemaMock),
                numberField: instance(numberFieldSchemaMock),
                booleanField: instance(booleanFieldSchemaMock),
                objectField: instance(objectFieldSchemaMock),
            });
        });

        // Not sure if this is worth testing since it seems more focused on an implmentation detail than it is an outcome
        it("should delegate to field validation", () => {
            const handler = new ObjectValidationHandler(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            verify(schemaMock.validate(anything(), anything())).never();

            verify(stringFieldSchemaMock.validate(anything(), anything())).once();
            verify(numberFieldSchemaMock.validate(anything(), anything())).once();
            verify(booleanFieldSchemaMock.validate(anything(), anything())).once();
            verify(objectFieldSchemaMock.validate(anything(), anything())).once();
        });

        describe("given valid data", () => {
            beforeEach(() => {
                when(
                    stringFieldSchemaMock.validate(VALID_TEST_OBJECT.stringField, anything())
                ).thenReturn(true);
                when(
                    numberFieldSchemaMock.validate(VALID_TEST_OBJECT.numberField, anything())
                ).thenReturn(true);
                when(
                    booleanFieldSchemaMock.validate(VALID_TEST_OBJECT.booleanField, anything())
                ).thenReturn(true);
                when(
                    objectFieldSchemaMock.validate(VALID_TEST_OBJECT.objectField, anything())
                ).thenReturn(true);
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

                expect(handler.errors.value).toBeIterable([]);
                expect(handler.errors.value).toEqual({
                    stringField: expect.toBeIterable([]),
                    numberField: expect.toBeIterable([]),
                    booleanField: expect.toBeIterable([]),
                    objectField: expect.toBeIterable([]),
                });
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(
                    stringFieldSchemaMock.validate(INVALID_TEST_OBJECT.stringField, anything())
                ).thenThrow(new SchemaValidationError(["stringField error"]));
                when(
                    numberFieldSchemaMock.validate(INVALID_TEST_OBJECT.numberField, anything())
                ).thenThrow(new SchemaValidationError(["numberField error"]));
                when(
                    booleanFieldSchemaMock.validate(INVALID_TEST_OBJECT.booleanField, anything())
                ).thenThrow(new SchemaValidationError(["booleanField error"]));
                when(
                    objectFieldSchemaMock.validate(INVALID_TEST_OBJECT.objectField, anything())
                ).thenThrow(new SchemaValidationError(["objectField error"]));
            });

            it("should return false", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();
                const errors = Array.from(handler.errors.value);

                expect(errors).toEqual([
                    "stringField error",
                    "numberField error",
                    "booleanField error",
                    "objectField error",
                ]);
                expect(handler.errors.value).toEqual({
                    stringField: expect.toBeIterable(["stringField error"]),
                    numberField: expect.toBeIterable(["numberField error"]),
                    booleanField: expect.toBeIterable(["booleanField error"]),
                    objectField: expect.toBeIterable(["objectField error"]),
                });
            });
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.reset(VALID_NESTED_OBJECT);

                expect(handler.value.value).toEqual(VALID_NESTED_OBJECT);
            });
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {
                const handler = new ObjectValidationHandler(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.value.value = INVALID_TEST_OBJECT;

                expect(handler.value.value).toEqual(INVALID_TEST_OBJECT);

                handler.reset();

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should reset handler value to schema default if no initial value", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = new ObjectValidationHandler(instance(schemaMock), {});

                handler.reset();

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });

        it("should set isValid to false", () => {
            when(schemaMock.validate(anything(), anything())).thenReturn(true);

            const handler = new ObjectValidationHandler(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);

            handler.reset();

            expect(handler.isValid.value).toBe(false);
        });

        it("should reset errors", () => {
            const stringFieldSchemaMock = mock(Schema);
            when(stringFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["stringField error"])
            );

            const numberFieldSchemaMock = mock(Schema);
            when(numberFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["numberField error"])
            );

            const booleanFieldSchemaMock = mock(Schema);
            when(booleanFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["booleanField error"])
            );

            const objectFieldSchemaMock = mock(Schema);
            when(objectFieldSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["objectField error"])
            );

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

            expect(handler.errors.value).toBeIterable([
                "stringField error",
                "numberField error",
                "booleanField error",
                "objectField error",
            ]);
            expect(handler.errors.value).toEqual({
                stringField: expect.toBeIterable(["stringField error"]),
                numberField: expect.toBeIterable(["numberField error"]),
                booleanField: expect.toBeIterable(["booleanField error"]),
                objectField: expect.toBeIterable(["objectField error"]),
            });

            handler.reset();

            expect(handler.errors.value).toEqual({
                stringField: expect.toBeIterable([]),
                numberField: expect.toBeIterable([]),
                booleanField: expect.toBeIterable([]),
                objectField: expect.toBeIterable([]),
            });
        });
    });

    describe("static create method", () => {
        describe("given initial value", () => {
            it("should throw a TypeError if ");

            it("should return an instance of ObjectValidationHandler with initial value", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                expect(handler).toBeInstanceOf(ObjectValidationHandler);
                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });
        });
    });
});
