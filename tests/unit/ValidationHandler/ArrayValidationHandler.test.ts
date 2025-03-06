import { instance, mock, when } from "ts-mockito";

import { ArrayValidationHandler } from "@/ValidationHandler";
import { Schema } from "@/Schema";
import { VALID_STRING } from "tests/fixtures/valid-data";

describe("ArrayValidationHandler", () => {
    let arraySchemaMock: Schema<"array">;
    let fieldSchemaMock: Schema<"primitive">;

    beforeEach(() => {
        arraySchemaMock = mock<Schema<"array">>();
        when(arraySchemaMock.type).thenReturn("array");
        when(arraySchemaMock.defaultValue).thenReturn([]);

        fieldSchemaMock = mock<Schema<"primitive">>();
        when(fieldSchemaMock.type).thenReturn("primitive");
        when(fieldSchemaMock.defaultValue).thenReturn(VALID_STRING);
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
            it("should update value when assigned", () => {
                const handler = ArrayValidationHandler.create(instance(arraySchemaMock), {});

                handler.value.value = [VALID_STRING];

                expect(handler.value.value).toEqual([VALID_STRING]);
            });

            it("should reuse existing field references for equal primitive values", () => {
                const handler = ArrayValidationHandler.create(arraySchemaMock, {
                    value: ["1", "2"],
                });

                const fieldOne = handler.fields.value[0];
                const fieldTwo = handler.fields.value[1];

                handler.value.value = ["2", "1"];

                expect(handler.fields.value[0]).toBe(fieldTwo);
                expect(handler.fields.value[1]).toBe(fieldOne);
            });

            it("should create new field references when adding primitive values", () => {
                const handler = ArrayValidationHandler.create(arraySchemaMock, {
                    value: ["1"],
                });
                const fieldOne = handler.fields.value[0];
                handler.value.value = ["1", "2"];

                expect(handler.fields.value).toEqual([fieldOne, expect.toBeSchemaValidation()]);
            });

            it("should create new field references when adding object values", () => {
                const objectSchemaMock = mock<Schema<"object">>();
                when(objectSchemaMock.type).thenReturn("object");
                when(objectSchemaMock.defaultValue).thenReturn({});
                when(objectSchemaMock.fields).thenReturn({});
            });

            it("should remove field references when removing values", () => {
                const handler = ArrayValidationHandler.create(arraySchemaMock, {
                    value: ["1", "2"],
                });
                const fieldTwo = handler.fields.value[1];
                handler.value.value = ["2"];

                expect(handler.fields.value).toEqual([fieldTwo]);
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
