import { expect } from "vitest";
import { anything, instance, reset, when } from "ts-mockito";

import { ObjectValidationHandler } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";

import { VALID_TEST_OBJECT } from "tests/fixtures/valid-data";
import {
    DEFAULT_BOOLEAN,
    DEFAULT_NESTED_OBJECT,
    DEFAULT_NUMBER,
    DEFAULT_STRING,
    DEFAULT_TEST_OBJECT,
} from "tests/fixtures/default-data";
import { INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";
import {
    objectSchemaMock,
    booleanSchemaMock,
    nestedObjectSchemaMock,
    nestedNumberSchemaMock,
    nestedBooleanSchemaMock,
    numberSchemaMock,
    stringSchemaMock,
    nestedStringSchemaMock,
    initializeObjectSchemaMock,
    resetObjectSchemaMock,
} from "tests/fixtures/mocks/object-schema.mock";

describe("ObjectValidationHandler", () => {
    beforeEach(() => {
        initializeObjectSchemaMock();
    });

    afterEach(() => {
        resetObjectSchemaMock();
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        // Enforcing readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            // @ts-expect-error
            handler.value = {} as any;
        });

        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.value.value).toEqual<TestSchema>({
                stringField: expect.any(String),
                numberField: expect.any(Number),
                booleanField: expect.any(Boolean),
                objectField: expect.any(Object),
            });
        });

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should initialize with schema default if no value provided", () => {
                when(objectSchemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });

        describe("assignment", () => {
            describe("given a partial value", () => {
                it("should merge provided value with schema default", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
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
                    when(objectSchemaMock.defaultValue).thenReturn({
                        stringField: DEFAULT_STRING,
                    });
                    when(booleanSchemaMock.defaultValue).thenReturn(false);
                    when(nestedObjectSchemaMock.defaultValue).thenReturn({
                        nestedStringField: DEFAULT_STRING,
                    });
                    when(nestedNumberSchemaMock.defaultValue).thenReturn(555);
                    when(nestedBooleanSchemaMock.defaultValue).thenReturn(false);

                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
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
                    when(objectSchemaMock.defaultValue).thenReturn({
                        stringField: DEFAULT_STRING,
                    });
                    when(numberSchemaMock.defaultValue).thenReturn(undefined);
                    when(booleanSchemaMock.defaultValue).thenReturn(undefined);
                    when(nestedObjectSchemaMock.defaultValue).thenReturn({
                        nestedStringField: DEFAULT_STRING,
                    });
                    when(nestedNumberSchemaMock.defaultValue).thenReturn(undefined);
                    when(nestedBooleanSchemaMock.defaultValue).thenReturn(undefined);

                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
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
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                        value: VALID_TEST_OBJECT,
                    });

                    handler.value.value = INVALID_TEST_OBJECT;

                    expect(handler.value.value).toEqual(INVALID_TEST_OBJECT);
                });
            });

            it("should not set isDirty for child fields that do not change", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: DEFAULT_TEST_OBJECT,
                });

                handler.value.value = {
                    ...VALID_TEST_OBJECT,
                    stringField: DEFAULT_STRING,
                };

                expect(handler.fields.stringField.isDirty).toBe(false);
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            // @ts-expect-error
            handler.errors = {} as any;
        });

        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.errors.value).toMatchObject({
                stringField: expect.toBeIterable(),
                numberField: expect.toBeIterable(),
                booleanField: expect.toBeIterable(),
                objectField: expect.toBeIterable(),
            });
        });

        it("should contain iterable $root property", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.errors.value).toHaveProperty("$root", expect.toBeIterable());
        });

        it("should be iterable for all field errors", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["string error"])
            );

            when(numberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["number error"])
            );

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            handler.validate();

            expect(handler.errors.value).toBeIterable(["string error", "number error"]);
        });

        it("should initialize as an empty iterable", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.errors.value).toBeIterable([]);
        });
    });

    describe("fields property", () => {
        it("should be an object containing all schema fields", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.fields).toEqual({
                stringField: expect.toBeSchemaValidation(String),
                numberField: expect.toBeSchemaValidation(Number),
                booleanField: expect.toBeSchemaValidation(Boolean),
                objectField: expect.toBeSchemaValidation(Object),
            });
        });

        it("should initialize nested object fields", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.fields.objectField.fields).toEqual({
                nestedStringField: expect.toBeSchemaValidation(String),
                nestedNumberField: expect.toBeSchemaValidation(Number),
                nestedBooleanField: expect.toBeSchemaValidation(Boolean),
            });
        });

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            // @ts-expect-error
            handler.fields = {};
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        // Enforcing the property is readonly at runtime is not worth the overhead for an internal class,
        // so this is a type only test
        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            // @ts-expect-error
            handler.isValid = {} as any;
        });

        it("should initialize to false", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if root is invalid", () => {
            when(objectSchemaMock.validateRoot(anything(), anything())).thenThrow(
                new SchemaValidationError(["root error"])
            );

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if any field is invalid", () => {
            when(objectSchemaMock.validateRoot(anything(), anything())).thenReturn(true);
            when(stringSchemaMock.validate(anything(), anything())).thenReturn(false);
            when(numberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(booleanSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedStringSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedNumberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedBooleanSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["nestedBooleanField error"])
            );

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.fields.objectField.isValid).toBe(false);
            expect(handler.isValid.value).toBe(false);
        });

        it("should be true if root is valid and all fields are valid", () => {
            when(objectSchemaMock.validateRoot(anything(), anything())).thenReturn(true);
            when(stringSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(numberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(booleanSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedStringSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedNumberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(nestedBooleanSchemaMock.validate(anything(), anything())).thenReturn(true);

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);
        });
    });

    describe("isDirty property", () => {
        it("should be a Vue ref", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.isDirty).toBeVueRef();
        });

        it("should be readonly", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            // @ts-expect-error
            handler.isDirty = {} as any;
        });

        it("should initialize to false", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

            expect(handler.isDirty.value).toBe(false);
        });

        it("should be true if any field is dirty", () => {
            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: DEFAULT_TEST_OBJECT,
            });

            handler.fields.objectField.value = {
                nestedStringField: "new value",
                nestedNumberField: DEFAULT_NUMBER,
                nestedBooleanField: DEFAULT_BOOLEAN,
            };
            expect(handler.fields.objectField.isDirty).toBe(true);
            expect(handler.isDirty.value).toBe(true);
        });
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            beforeEach(() => {
                when(objectSchemaMock.validateRoot(VALID_TEST_OBJECT, anything())).thenReturn(true);
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
                    nestedObjectSchemaMock.validate(VALID_TEST_OBJECT.objectField, anything())
                ).thenReturn(true);
            });

            it("should return true", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.errors.value).toBeIterable([]);
                expect(handler.errors.value.objectField).toBeIterable([]);
                expect(handler.errors.value).toMatchObject({
                    $root: expect.toBeIterable([]),
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
                when(objectSchemaMock.validateRoot(anything(), anything())).thenThrow(
                    new SchemaValidationError(["root error"])
                );
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
                    nestedObjectSchemaMock.validate(INVALID_TEST_OBJECT.objectField, anything())
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
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                const returnValue = handler.validate();

                expect(returnValue).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: expect.toBeIterable(["root error"]),
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

        it("should throw if an unexpected error occurs", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new Error("unexpected")
            );

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            expect(() => {
                handler.validate();
            }).toThrow(Error);
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: INVALID_TEST_OBJECT,
                });

                handler.reset(VALID_TEST_OBJECT);

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            describe("when value is a partial object", () => {
                it("should merge provided value with initial value", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
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
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                handler.value.value = INVALID_TEST_OBJECT;

                expect(handler.value.value).toEqual(INVALID_TEST_OBJECT);

                handler.reset();

                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });

            it("should reset handler value to schema default if no initial value", () => {
                when(objectSchemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                handler.reset();

                expect(handler.value.value).toEqual(DEFAULT_TEST_OBJECT);
            });
        });

        it("should reset errors", () => {
            when(objectSchemaMock.validateRoot(anything(), anything())).thenThrow(
                new SchemaValidationError(["root error"])
            );
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

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.errors.value).toMatchObject({
                $root: expect.toBeIterable(["root error"]),
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
                $root: expect.toBeIterable([]),
                stringField: expect.toBeIterable([]),
                numberField: expect.toBeIterable([]),
                booleanField: expect.toBeIterable([]),
                objectField: expect.toBeIterable([]),
            });
        });

        it("should set all fields' isValid to false", () => {
            when(objectSchemaMock.validate(anything(), anything())).thenReturn(true);

            const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                value: VALID_TEST_OBJECT,
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);

            handler.reset();

            expect(handler.isValid.value).toBe(false);
            expect(handler.fields.stringField.isValid).toBe(false);
            expect(handler.fields.numberField.isValid).toBe(false);
            expect(handler.fields.booleanField.isValid).toBe(false);
            expect(handler.fields.objectField.isValid).toBe(false);
        });

        it("should set all fields' isDirty to false", () => {});
    });

    describe("toReactive method", () => {
        describe("return value", () => {
            it("should be schema validation object", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeSchemaValidation(Object);
            });

            describe("errors property", () => {
                it("should be readonly", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.errors = {} as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.errors).toMatchObject({
                        stringField: expect.toBeIterable(),
                        numberField: expect.toBeIterable(),
                        booleanField: expect.toBeIterable(),
                        objectField: expect.toBeIterable(),
                    });
                });

                it("should have readonly properties", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();
                    const originalErrors = reactive.errors;

                    //@ts-expect-error
                    reactive.errors.stringField = {} as any;

                    expect(reactive.errors).toEqual(originalErrors);
                });
            });

            describe("fields property", () => {
                it("should be readonly", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.fields = {} as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.fields).toMatchObject({
                        stringField: expect.toBeSchemaValidation(String),
                        numberField: expect.toBeSchemaValidation(Number),
                        booleanField: expect.toBeSchemaValidation(Boolean),
                        objectField: expect.toBeSchemaValidation(Object),
                    });
                });

                it("should have readonly properties", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();
                    const originalFields = reactive.fields;

                    //@ts-expect-error
                    reactive.fields.stringField = {} as any;

                    expect(reactive.fields).toEqual(originalFields);
                });

                it("should have writable nested properties", () => {
                    const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                    const reactive = handler.toReactive();

                    reactive.fields.stringField.value = "new string";

                    expect(reactive.fields.stringField.value).toBe("new string");
                });
            });

            it("should have readonly isValid property", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                const reactive = handler.toReactive();

                expect(() => {
                    //@ts-expect-error
                    reactive.isValid = {} as any;
                }).toThrow();
            });

            it("should have readonly isDirty property", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {});

                const reactive = handler.toReactive();

                expect(() => {
                    //@ts-expect-error
                    reactive.isDirty = {} as any;
                }).toThrow();
            });
        });
    });

    // We're already using the static create method in the rest of the tests, so this is just a formality
    describe("static create method", () => {
        describe("given initial value", () => {
            it("should throw a TypeError if provided value is not an object", () => {
                expect(() => {
                    ObjectValidationHandler.create(instance(objectSchemaMock), {
                        value: "not an object",
                    });
                }).toThrow(TypeError);
            });

            it("should return an instance of ObjectValidationHandler with initial value", () => {
                const handler = ObjectValidationHandler.create(instance(objectSchemaMock), {
                    value: VALID_TEST_OBJECT,
                });

                expect(handler).toBeInstanceOf(ObjectValidationHandler);
                expect(handler.value.value).toEqual(VALID_TEST_OBJECT);
            });
        });
    });
});
