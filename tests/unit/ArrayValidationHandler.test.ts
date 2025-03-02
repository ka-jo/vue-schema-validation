import { mock, when } from "ts-mockito";

import { ArrayValidationHandler } from "@/ValidationHandler";
import { Schema } from "@/Schema";
import { VALID_STRING } from "tests/fixtures/valid-data";

describe("ArrayValidationHandler", () => {
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
