import { anything, instance, mock, when } from "ts-mockito";

import { ArrayValidationHandler } from "@/ValidationHandler";
import { Schema, SchemaValidationError } from "@/Schema";
import {
    VALID_BOOLEAN,
    VALID_NUMBER,
    VALID_STRING,
    VALID_TEST_OBJECT,
} from "tests/fixtures/valid-data";
import {
    initializeObjectSchemaMock,
    objectSchemaMock,
    resetObjectSchemaMock,
} from "tests/fixtures/mocks/object-schema.mock";
import { DEFAULT_STRING, DEFAULT_TEST_OBJECT } from "tests/fixtures/default-data";
import { INVALID_STRING } from "tests/fixtures/invalid-data";

describe("ArrayValidationHandler", () => {
    let arraySchemaMock: Schema<"array">;
    let stringFieldSchemaMock: Schema<"primitive">;

    beforeEach(() => {
        arraySchemaMock = mock<Schema<"array">>();
        when(arraySchemaMock.type).thenReturn("array");
        when(arraySchemaMock.defaultValue).thenReturn([]);

        stringFieldSchemaMock = mock<Schema<"primitive">>();
        when(stringFieldSchemaMock.type).thenReturn("primitive");
        when(stringFieldSchemaMock.defaultValue).thenReturn(VALID_STRING);

        when(arraySchemaMock.fields).thenReturn(instance(stringFieldSchemaMock));
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.value).toBeVueRef();
        });

        describe("initialization", () => {
            it("should initialize with provided value", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING],
                });

                expect(handler.value.value).toEqual([VALID_STRING]);
            });

            it("should initialize with schema default if no value is provided", () => {
                when(arraySchemaMock.defaultValue).thenReturn([VALID_STRING]);

                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                expect(handler.value.value).toEqual([VALID_STRING]);
            });

            it("should initialize with empty array if no value or schema default is provided", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                expect(handler.value.value).toEqual([]);
            });
        });

        describe("assignment", () => {
            it("should update value", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = [VALID_STRING];

                expect(handler.value.value).toEqual([VALID_STRING]);
            });

            // This requires more thought, but I'm going to stick with this behavior for now.
            // To illustrate my concerns, consider a scenario where one value is pushed to an array of primitives.
            // All of the field references will be recreated even though all of their values remained the same.
            // But if references are shared for equal primitives, an array that contains the same value twice
            // would cause changes in one field to be reflected in the other, which is not what we want.
            // Perhaps we could try to share references for primitive values based position in the array.
            it("should not reuse existing field references for equal primitive values", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: ["1", "2"],
                });

                const fieldOne = handler.fields.value[0];
                const fieldTwo = handler.fields.value[1];

                handler.value.value = ["2", "1"];

                expect(handler.fields.value[0]).not.toBe(fieldTwo);
                expect(handler.fields.value[1]).not.toBe(fieldOne);
            });

            it("should create new field references when adding primitive values", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: ["1"],
                });

                expect(handler.fields.value).not.toHaveProperty("1");

                handler.value.value = ["1", "2"];

                expect(handler.fields.value).toHaveProperty(
                    "1",
                    expect.toBeSchemaValidation(String)
                );
            });

            it("should create new field references when adding object values", () => {
                resetObjectSchemaMock();
                initializeObjectSchemaMock();
                when(arraySchemaMock.fields).thenReturn(instance(objectSchemaMock));
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = [{}];

                expect(handler.fields.value).toEqual([expect.toBeSchemaValidation(Object)]);
                expect(handler.fields.value[0].value).toEqual(DEFAULT_TEST_OBJECT);
            });

            it("should reuse existing field references for equal object values", () => {
                resetObjectSchemaMock();
                initializeObjectSchemaMock();
                when(arraySchemaMock.fields).thenReturn(instance(objectSchemaMock));
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [DEFAULT_TEST_OBJECT],
                });

                const field = handler.fields.value[0];

                handler.value.value = [...handler.value.value];

                expect(handler.fields.value[0]).toBe(field);
            });

            it("should remove field references when removing values", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: ["1", "2"],
                });
                const fieldTwo = handler.fields.value[1];
                handler.value.value = ["2"];

                expect(handler.fields.value).toEqual([fieldTwo]);
            });

            it("should create new properties in errors object when adding values", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING],
                });

                expect(handler.errors.value).not.toHaveProperty("1");

                handler.value.value = ["1", "2"];

                expect(handler.errors.value).toMatchObject({
                    0: [],
                    1: [],
                });
            });

            it("should remove properties from errors object when removing values", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING, VALID_STRING],
                });

                expect(handler.errors.value).toHaveProperty("1");

                handler.value.value = ["1"];

                expect(handler.errors.value).not.toHaveProperty("1");
            });

            it("should set isDirty to true", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = [VALID_STRING];

                expect(handler.isDirty.value).toBe(true);
            });

            it("should not set fields isDirty to true", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = [VALID_STRING];

                expect(handler.fields.value[0].isDirty).toBe(false);
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.errors).toBeVueRef();
        });

        it("should contain iterable $root property", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.errors.value).toHaveProperty("$root", expect.toBeIterable());
        });

        it("should have number keys with field errors as value", () => {
            when(stringFieldSchemaMock.validate(INVALID_STRING, anything())).thenThrow(
                new SchemaValidationError(["field error"])
            );
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [INVALID_STRING, INVALID_STRING],
            });

            handler.validate();

            expect(handler.errors.value).toMatchObject({
                0: ["field error"],
                1: ["field error"],
            });
        });

        it("should be iterable for all field errors", () => {
            when(stringFieldSchemaMock.validate(INVALID_STRING, anything())).thenThrow(
                new SchemaValidationError(["field error"])
            );
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [INVALID_STRING, INVALID_STRING],
            });

            handler.validate();

            expect(handler.errors.value).toBeIterable(["field error", "field error"]);
        });
    });

    describe("fields property", () => {
        it("should be a Vue ref", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.fields).toBeVueRef();
        });

        it("should contain a SchemaValidation object for each value", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [VALID_STRING, VALID_NUMBER, VALID_BOOLEAN],
            });

            expect(handler.fields.value).toEqual([
                expect.toBeSchemaValidation(String),
                expect.toBeSchemaValidation(Number),
                expect.toBeSchemaValidation(Boolean),
            ]);
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        it("should intialize to false", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if root is invalid", () => {
            when(arraySchemaMock.validateRoot(anything(), anything())).thenThrow(
                new SchemaValidationError(["root error"])
            );
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            handler.validate();

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if any field is invalid", () => {
            when(stringFieldSchemaMock.validate(INVALID_STRING, anything())).thenThrow(
                new SchemaValidationError(["field error"])
            );
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [INVALID_STRING, "another string", "and another string"],
            });

            handler.validate();

            expect(handler.isValid.value).toBe(false);
        });

        it("should be true if root is valid and all fields are valid", () => {
            when(arraySchemaMock.validateRoot(anything(), anything())).thenReturn(true);
            when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [VALID_STRING, VALID_NUMBER, VALID_BOOLEAN],
            });

            handler.validate();

            expect(handler.isValid.value).toBe(true);
        });
    });

    describe("isDirty property", () => {
        it("should be a Vue ref", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.isDirty).toBeVueRef();
        });

        it("should initialize to false", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.isDirty.value).toBe(false);
        });

        it("should be true if root is dirty", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), { value: [] });

            handler.value.value = [];

            expect(handler.isDirty.value).toBe(true);
        });

        it("should be true if any field is dirty", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [DEFAULT_STRING],
            });

            handler.fields.value[0].value = VALID_STRING;

            expect(handler.fields.value[0].isDirty).toBe(true);
            expect(handler.isDirty.value).toBe(true);
        });
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            beforeEach(() => {
                when(arraySchemaMock.validateRoot(anything(), anything())).thenReturn(true);
                when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);
            });

            it("should return true", () => {
                when(arraySchemaMock.validateRoot(anything(), anything())).thenReturn(true);
                when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING],
                });

                const result = handler.validate();

                expect(result).toBe(true);
            });

            it("should set isValid to true", () => {
                when(arraySchemaMock.validateRoot(anything(), anything())).thenReturn(true);
                when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING],
                });

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should clear all errors", () => {
                when(arraySchemaMock.validateRoot(anything(), anything())).thenReturn(true);
                when(stringFieldSchemaMock.validate(anything(), anything())).thenReturn(true);
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [VALID_STRING],
                });

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: expect.toBeIterable([]),
                    0: expect.toBeIterable([]),
                });
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(arraySchemaMock.validateRoot(anything(), anything())).thenThrow(
                    new SchemaValidationError(["root error"])
                );
                when(stringFieldSchemaMock.validate(anything(), anything())).thenThrow(
                    new SchemaValidationError(["field error"])
                );
            });

            it("should return false", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [INVALID_STRING],
                });

                const result = handler.validate();

                expect(result).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [INVALID_STRING],
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should set errors for each field", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: [INVALID_STRING],
                });

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: expect.toBeIterable(["root error"]),
                    0: expect.toBeIterable(["field error"]),
                });
            });
        });

        it("should throw if an unexpected error occurs", () => {
            when(arraySchemaMock.validateRoot(anything(), anything())).thenThrow(
                new Error("unexpected")
            );
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(() => {
                handler.validate();
            }).toThrow(Error);
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should set the value to the provided value", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.reset([VALID_STRING]);

                expect(handler.value.value).toEqual([VALID_STRING]);
            });
        });

        describe("given no value", () => {
            it("should set value to initial value", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                    value: ["initial value"],
                });

                handler.value.value = ["new value"];

                handler.reset();

                expect(handler.value.value).toEqual(["initial value"]);
            });

            it("should set value to schema default if no initial value is provided", () => {
                when(arraySchemaMock.defaultValue).thenReturn(["default value"]);
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = ["new value"];

                handler.reset();

                expect(handler.value.value).toEqual(["default value"]);
            });
        });

        it("should add fields if necessary", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            expect(handler.fields.value).toEqual([]);

            handler.reset([VALID_STRING]);

            expect(handler.fields.value).toEqual([expect.toBeSchemaValidation(String)]);
        });

        it("should remove fields if necessary", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [VALID_STRING],
            });

            expect(handler.fields.value).toEqual([expect.toBeSchemaValidation(String)]);

            handler.reset([]);

            expect(handler.fields.value).toEqual([]);
        });

        // This is a bit silly because it will recreate the field references and isDirty will initialize to false anyway
        it("should set all primitive fields' isDirty to false", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [DEFAULT_STRING],
            });

            handler.fields.value[0].value = VALID_STRING;

            expect(handler.fields.value[0].isDirty).toBe(true);

            handler.reset([VALID_STRING]);

            expect(handler.fields.value[0].isDirty).toBe(false);
        });

        // Not quite sure what I want the final behavior to be around field references, so I'm just getting a test
        // in place that passes for now.
        it("should set all non-primitive fields' isDirty to false", () => {
            resetObjectSchemaMock();
            initializeObjectSchemaMock();
            when(arraySchemaMock.fields).thenReturn(instance(objectSchemaMock));
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [DEFAULT_TEST_OBJECT],
            });

            handler.fields.value[0].value = VALID_TEST_OBJECT;

            expect(handler.fields.value[0].isDirty).toBe(true);

            handler.reset([DEFAULT_TEST_OBJECT]);

            expect(handler.fields.value[0].isDirty).toBe(false);
        });

        it("should set isDirty to false", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

            handler.value.value = [VALID_STRING];

            expect(handler.isDirty.value).toBe(true);

            handler.reset([VALID_STRING]);

            expect(handler.isDirty.value).toBe(false);
        });

        it("should clear all errors", () => {
            const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                value: [VALID_STRING],
            });

            handler.reset([VALID_STRING]);

            expect(handler.errors.value).toMatchObject({
                $root: expect.toBeIterable([]),
                0: expect.toBeIterable([]),
            });
        });
    });

    describe("toReactive method", () => {
        describe("return value", () => {
            it("should be a SchemaValidation object", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeSchemaValidation(Array);
            });

            describe("errors property", () => {
                it("should be readonly", () => {
                    const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.errors = {} as any;
                    }).toThrow();
                });

                it("should have readonly properties", () => {
                    const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                        value: [VALID_STRING],
                    });

                    const reactive = handler.toReactive();
                    const originalRootErrors = reactive.errors.$root;
                    const originalFieldErrors = reactive.errors[0];

                    //@ts-expect-error
                    reactive.errors.$root = {} as any;
                    //@ts-expect-error
                    reactive.errors[0] = {} as any;

                    expect(reactive.errors.$root).toBe(originalRootErrors);
                    expect(reactive.errors[0]).toBe(originalFieldErrors);
                });
            });

            describe("fields property", () => {
                it("should be readonly", () => {
                    const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.fields = {} as any;
                    }).toThrow();
                });

                it("should have readonly properties", () => {
                    const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                        value: [VALID_STRING],
                    });

                    const reactive = handler.toReactive();
                    const originalFields = reactive.fields;
                    //@ts-expect-error
                    reactive.fields[0] = {} as any;

                    expect(reactive.fields).toBe(originalFields);
                });

                it("should have writable nested properties", () => {
                    resetObjectSchemaMock();
                    initializeObjectSchemaMock();
                    when(arraySchemaMock.fields).thenReturn(instance(objectSchemaMock));
                    const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {
                        value: [DEFAULT_TEST_OBJECT],
                    });

                    const reactive = handler.toReactive();

                    expect(() => {
                        reactive.fields[0].value = VALID_TEST_OBJECT;
                        expect(reactive.fields[0].value).toEqual(VALID_TEST_OBJECT);
                    }).not.toThrow();
                });
            });

            it("should have readonly isValid property", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                const reactive = handler.toReactive();

                expect(() => {
                    //@ts-expect-error
                    reactive.isValid = {} as any;
                }).toThrow();
            });

            it("should have readonly isDirty property", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                const reactive = handler.toReactive();

                expect(() => {
                    //@ts-expect-error
                    reactive.isDirty = {} as any;
                }).toThrow();
            });
        });
    });

    describe("static create method", () => {
        describe("given initial value", () => {
            it("should throw a TypeError if initial value is not an array", () => {
                const schemaMock = mock<Schema<"array">>();
                when(schemaMock.type).thenReturn("array");

                expect(() => {
                    ArrayValidationHandler.create(schemaMock, { value: {} });
                }).toThrow(TypeError);
            });

            it("should return an instance of ArrayValidationHandler with initial value", () => {
                const schemaMock = mock<Schema<"array">>();
                when(schemaMock.type).thenReturn("array");

                const handler = ArrayValidationHandler.create(schemaMock, {
                    value: [VALID_STRING],
                });

                expect(handler).toBeInstanceOf(ArrayValidationHandler);
                expect(handler.value.value).toEqual([VALID_STRING]);
            });
        });
    });
});
