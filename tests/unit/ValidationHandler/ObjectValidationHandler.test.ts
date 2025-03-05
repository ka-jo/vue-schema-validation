import { expect } from "vitest";
import { anything, instance, mock, verify, when } from "ts-mockito";

import { ValidationHandler, ObjectValidationHandler } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";

import { VALID_TEST_OBJECT, VALID_NESTED_OBJECT } from "tests/fixtures/valid-data";
import {
    DEFAULT_BOOLEAN,
    DEFAULT_NESTED_OBJECT,
    DEFAULT_NUMBER,
    DEFAULT_STRING,
    DEFAULT_TEST_OBJECT,
} from "tests/fixtures/default-data";
import { INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";

describe("ObjectValidationHandler", () => {
    let schemaMock: Schema<"object">;
    let stringSchemaMock: Schema<"primitive">;
    let numberSchemaMock: Schema<"primitive">;
    let booleanSchemaMock: Schema<"primitive">;
    let objectSchemaMock: Schema<"object">;
    let nestedStringSchemaMock: Schema<"primitive">;
    let nestedNumberSchemaMock: Schema<"primitive">;
    let nestedBooleanSchemaMock: Schema<"primitive">;

    beforeEach(() => {
        schemaMock = mock<Schema<"object">>();
        when(schemaMock.type).thenReturn("object");
        when(schemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);

        stringSchemaMock = mock<Schema<"primitive">>();
        when(stringSchemaMock.type).thenReturn("primitive");
        when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

        numberSchemaMock = mock<Schema<"primitive">>();
        when(numberSchemaMock.type).thenReturn("primitive");
        when(numberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);

        booleanSchemaMock = mock<Schema<"primitive">>();
        when(booleanSchemaMock.type).thenReturn("primitive");
        when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);

        objectSchemaMock = mock<Schema<"object">>();
        when(objectSchemaMock.type).thenReturn("object");
        when(objectSchemaMock.defaultValue).thenReturn(DEFAULT_NESTED_OBJECT);

        nestedStringSchemaMock = mock<Schema<"primitive">>();
        when(nestedStringSchemaMock.type).thenReturn("primitive");
        when(nestedStringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

        nestedNumberSchemaMock = mock<Schema<"primitive">>();
        when(nestedNumberSchemaMock.type).thenReturn("primitive");
        when(nestedNumberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);

        nestedBooleanSchemaMock = mock<Schema<"primitive">>();
        when(nestedBooleanSchemaMock.type).thenReturn("primitive");
        when(nestedBooleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);

        when(schemaMock.fields).thenReturn({
            stringField: instance(stringSchemaMock),
            numberField: instance(numberSchemaMock),
            booleanField: instance(booleanSchemaMock),
            objectField: instance(objectSchemaMock),
        });

        when(objectSchemaMock.fields).thenReturn({
            nestedStringField: instance(nestedStringSchemaMock),
            nestedNumberField: instance(nestedNumberSchemaMock),
            nestedBooleanField: instance(nestedBooleanSchemaMock),
        });
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            // @ts-expect-error
            handler.value = {} as any;
        });

        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.value.value).toEqual<TestSchema>({
                stringField: expect.any(String),
                numberField: expect.any(Number),
                booleanField: expect.any(Boolean),
                objectField: expect.any(Object),
            });
        });

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should initialize with schema default if no value provided", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });

        describe("assignment", () => {
            describe("given a partial value", () => {
                it("should merge provided value with schema default", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {
                        value: VALID_TEST_OBJECT,
                    });

                    handler.value.value = {
                        stringField: "new string",
                    };

                    expect(handler.value.value).toEqual({
                        stringField: "new string",
                        numberField: DEFAULT_NUMBER,
                        booleanField: DEFAULT_BOOLEAN,
                        objectField: DEFAULT_NESTED_OBJECT,
                    });
                });

                // If the schema provides a partial default value, we should fall back to the schema defaults for the missing fields
                it("should merge provided value with schema default and field defaults", () => {
                    when(schemaMock.defaultValue).thenReturn({
                        stringField: DEFAULT_STRING,
                    });
                    when(booleanSchemaMock.defaultValue).thenReturn(false);
                    when(objectSchemaMock.defaultValue).thenReturn({
                        nestedStringField: DEFAULT_STRING,
                    });
                    when(nestedNumberSchemaMock.defaultValue).thenReturn(555);
                    when(nestedBooleanSchemaMock.defaultValue).thenReturn(false);

                    const handler = ObjectValidationHandler.create(instance(schemaMock), {
                        value: VALID_TEST_OBJECT,
                    });

                    handler.value.value = {
                        numberField: 777,
                    };

                    expect(handler.value.value).toEqual({
                        stringField: DEFAULT_STRING,
                        numberField: 777,
                        booleanField: false,
                        objectField: {
                            nestedStringField: DEFAULT_STRING,
                            nestedNumberField: 555,
                            nestedBooleanField: false,
                        },
                    });
                });

                // If the schema provides a partial default value (or no default value) and the field has no default value,
                // the field value should be set to null
                it("should result in null value if no schema default for field", () => {
                    when(schemaMock.defaultValue).thenReturn({
                        stringField: DEFAULT_STRING,
                    });
                    when(numberSchemaMock.defaultValue).thenReturn(undefined);
                    when(booleanSchemaMock.defaultValue).thenReturn(undefined);
                    when(objectSchemaMock.defaultValue).thenReturn({
                        nestedStringField: DEFAULT_STRING,
                    });
                    when(nestedNumberSchemaMock.defaultValue).thenReturn(undefined);
                    when(nestedBooleanSchemaMock.defaultValue).thenReturn(undefined);

                    const handler = ObjectValidationHandler.create(instance(schemaMock), {
                        value: VALID_TEST_OBJECT,
                    });

                    handler.value.value = {
                        numberField: 777,
                    };

                    expect(handler.value.value).toEqual({
                        stringField: DEFAULT_STRING,
                        numberField: 777,
                        booleanField: null,
                        objectField: {
                            nestedStringField: DEFAULT_STRING,
                            nestedNumberField: null,
                            nestedBooleanField: null,
                        },
                    });
                });
            });

            describe("given a complete value", () => {
                it("should replace value with provided value", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {
                        value: VALID_TEST_OBJECT,
                    });

                    handler.value.value = INVALID_TEST_OBJECT;

                    expect(handler.value.value).toEqual(INVALID_TEST_OBJECT);
                });
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            // @ts-expect-error
            handler.errors = {} as any;
        });

        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors.value).toMatchObject({
                stringField: expect.toBeIterable(),
                numberField: expect.toBeIterable(),
                booleanField: expect.toBeIterable(),
                objectField: expect.toBeIterable(),
            });
        });

        it("should be iterable for all field errors", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["string error"])
            );

            when(numberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["number error"])
            );

            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            handler.validate();

            expect(handler.errors.value).toBeIterable(["string error", "number error"]);
        });

        it("should initialize as an empty iterable", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            // @ts-expect-error
            handler.isValid = {} as any;
        });

        it("should initialize to false", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });
    });

    describe("fields property", () => {
        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.fields).toEqual({
                stringField: expect.toBeSchemaValidation(String),
                numberField: expect.toBeSchemaValidation(Number),
                booleanField: expect.toBeSchemaValidation(Boolean),
                objectField: expect.toBeSchemaValidation(Object),
            });
        });

        it("should initialize nested object fields", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

            expect(handler.fields.objectField.fields).toEqual({
                nestedStringField: expect.toBeSchemaValidation(String),
                nestedNumberField: expect.toBeSchemaValidation(Number),
                nestedBooleanField: expect.toBeSchemaValidation(Boolean),
            });
        });

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {});

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

        // Not sure if this is worth testing since it seems more focused on an implmentation detail than it is an outcome
        it("should delegate to field validation", () => {
            const handler = ObjectValidationHandler.create(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            verify(schemaMock.validate(anything(), anything())).never();

            verify(stringSchemaMock.validate(anything(), anything())).once();
            verify(numberSchemaMock.validate(anything(), anything())).once();
            verify(booleanSchemaMock.validate(anything(), anything())).once();

            // Nested object properties should also delegate to fields
            verify(objectSchemaMock.validate(anything(), anything())).never();

            verify(nestedStringSchemaMock.validate(anything(), anything())).once();
            verify(nestedNumberSchemaMock.validate(anything(), anything())).once();
            verify(nestedBooleanSchemaMock.validate(anything(), anything())).once();
        });

        describe("given valid data", () => {
            beforeEach(() => {
                when(
                    stringSchemaMock.validate(VALID_TEST_OBJECT.stringField, anything())
                ).thenReturn(true);
                when(
                    numberSchemaMock.validate(VALID_TEST_OBJECT.numberField, anything())
                ).thenReturn(true);
                when(
                    booleanSchemaMock.validate(VALID_TEST_OBJECT.booleanField, anything())
                ).thenReturn(true);
                when(
                    objectSchemaMock.validate(VALID_TEST_OBJECT.objectField, anything())
                ).thenReturn(true);
            });

            it("should return true", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.errors.value).toBeIterable([]);
                expect(handler.errors.value.objectField).toBeIterable([]);
                expect(handler.errors.value).toMatchObject({
                    stringField: expect.toBeIterable([]),
                    numberField: expect.toBeIterable([]),
                    booleanField: expect.toBeIterable([]),
                    objectField: {
                        nestedStringField: expect.toBeIterable([]),
                        nestedNumberField: expect.toBeIterable([]),
                        nestedBooleanField: expect.toBeIterable([]),
                    },
                });
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(
                    stringSchemaMock.validate(INVALID_TEST_OBJECT.stringField, anything())
                ).thenThrow(new SchemaValidationError(["stringField error"]));
                when(
                    numberSchemaMock.validate(INVALID_TEST_OBJECT.numberField, anything())
                ).thenThrow(new SchemaValidationError(["numberField error"]));
                when(
                    booleanSchemaMock.validate(INVALID_TEST_OBJECT.booleanField, anything())
                ).thenThrow(new SchemaValidationError(["booleanField error"]));
                when(
                    objectSchemaMock.validate(INVALID_TEST_OBJECT.objectField, anything())
                ).thenThrow(new SchemaValidationError(["objectField error"]));

                when(
                    nestedStringSchemaMock.validate(
                        INVALID_TEST_OBJECT.objectField.nestedStringField,
                        anything()
                    )
                ).thenThrow(new SchemaValidationError(["nestedStringField error"]));
                when(
                    nestedNumberSchemaMock.validate(
                        INVALID_TEST_OBJECT.objectField.nestedNumberField,
                        anything()
                    )
                ).thenThrow(new SchemaValidationError(["nestedNumberField error"]));
                when(
                    nestedBooleanSchemaMock.validate(
                        INVALID_TEST_OBJECT.objectField.nestedBooleanField,
                        anything()
                    )
                ).thenThrow(new SchemaValidationError(["nestedBooleanField error"]));
            });

            it("should return false", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();
                const errors = Array.from(handler.errors.value);

                expect(errors).toEqual([
                    "stringField error",
                    "numberField error",
                    "booleanField error",
                    "nestedStringField error",
                    "nestedNumberField error",
                    "nestedBooleanField error",
                ]);
                expect(handler.errors.value).toMatchObject({
                    stringField: expect.toBeIterable(["stringField error"]),
                    numberField: expect.toBeIterable(["numberField error"]),
                    booleanField: expect.toBeIterable(["booleanField error"]),
                    objectField: expect.toBeIterable([
                        "nestedStringField error",
                        "nestedNumberField error",
                        "nestedBooleanField error",
                    ]),
                });
            });
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.reset(VALID_TEST_OBJECT);

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            describe("when value is a partial object", () => {
                it("should merge provided value with initial value", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {
                        value: INVALID_TEST_OBJECT,
                    });

                    handler.reset({
                        stringField: VALID_TEST_OBJECT.stringField,
                    });

                    expect(handler.value.value).toEqual({
                        stringField: VALID_TEST_OBJECT.stringField,
                        numberField: INVALID_TEST_OBJECT.numberField,
                        booleanField: INVALID_TEST_OBJECT.booleanField,
                        objectField: INVALID_TEST_OBJECT.objectField,
                    });
                });
            });
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.value.value = INVALID_TEST_OBJECT;

                expect(handler.value.value).toEqual(INVALID_TEST_OBJECT);

                handler.reset();

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should reset handler value to schema default if no initial value", () => {
                when(schemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                handler.reset();

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });

        it("should set isValid to false", () => {
            when(schemaMock.validate(anything(), anything())).thenReturn(true);

            const handler = ObjectValidationHandler.create(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);

            handler.reset();

            expect(handler.isValid.value).toBe(false);
        });

        it("should reset errors", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["stringField error"])
            );
            when(numberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["numberField error"])
            );
            when(booleanSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["booleanField error"])
            );
            when(nestedStringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["nestedStringField error"])
            );
            when(nestedNumberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["nestedNumberField error"])
            );
            when(nestedBooleanSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["nestedBooleanField error"])
            );

            const handler = ObjectValidationHandler.create(instance(schemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.errors.value).toBeIterable([
                "stringField error",
                "numberField error",
                "booleanField error",
                "nestedStringField error",
                "nestedNumberField error",
                "nestedBooleanField error",
            ]);
            expect(handler.errors.value).toMatchObject({
                stringField: expect.toBeIterable(["stringField error"]),
                numberField: expect.toBeIterable(["numberField error"]),
                booleanField: expect.toBeIterable(["booleanField error"]),
                objectField: expect.toBeIterable([
                    "nestedStringField error",
                    "nestedNumberField error",
                    "nestedBooleanField error",
                ]),
            });

            handler.reset();

            expect(handler.errors.value).toMatchObject({
                stringField: expect.toBeIterable([]),
                numberField: expect.toBeIterable([]),
                booleanField: expect.toBeIterable([]),
                objectField: expect.toBeIterable([]),
            });
        });
    });

    describe("toReactive method", () => {
        describe("return value", () => {
            it("should be schema validation object", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeSchemaValidation(Object);
            });

            describe("fields property", () => {
                it("should be readonly", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.fields = {} as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.fields).toMatchObject({
                        stringField: expect.toBeSchemaValidation(String),
                        numberField: expect.toBeSchemaValidation(Number),
                        booleanField: expect.toBeSchemaValidation(Boolean),
                        objectField: expect.toBeSchemaValidation(Object),
                    });
                });

                it("should have readonly properties", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();
                    const originalFields = reactive.fields;

                    //@ts-expect-error
                    reactive.fields.stringField = {} as any;

                    expect(reactive.fields).toEqual(originalFields);
                });
            });

            it("isValid property should be readonly", () => {
                const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                const reactive = handler.toReactive();

                expect(() => {
                    //@ts-expect-error
                    reactive.isValid = {} as any;
                }).toThrow();
            });

            describe("errors property", () => {
                it("should be readonly", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.errors = {} as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.errors).toMatchObject({
                        stringField: expect.toBeIterable(),
                        numberField: expect.toBeIterable(),
                        booleanField: expect.toBeIterable(),
                        objectField: expect.toBeIterable(),
                    });
                });

                it("should have readonly properties", () => {
                    const handler = ObjectValidationHandler.create(instance(schemaMock), {});

                    const reactive = handler.toReactive();
                    const originalErrors = reactive.errors;

                    //@ts-expect-error
                    reactive.errors.stringField = {} as any;

                    expect(reactive.errors).toEqual(originalErrors);
                });
            });
        });
    });

    // We're already using the static create method in the rest of the tests, so this is just a formality
    describe("static create method", () => {
        describe("given initial value", () => {
            it("should throw a TypeError if provided value is not an object", () => {
                expect(() => {
                    ObjectValidationHandler.create(instance(schemaMock), {
                        value: "not an object",
                    });
                }).toThrow(TypeError);
            });

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
