import {
    Schema as yup_Schema,
    ValidationError as yup_ValidationError,
    ObjectSchema as yup_ObjectSchema,
    ArraySchema as yup_ArraySchema,
    LazySchema as yup_LazySchema,
    Reference as yup_Reference,
} from "yup";
import { anything, instance, mock, when } from "ts-mockito";

import { Schema } from "@/Schema/Schema";
import { YupSchema } from "@/Schema/YupSchema";
import { SchemaValidationError } from "@/Schema/SchemaValidationError";
import { UnknownSchema } from "@/Schema/UnknownSchema";

import { VALID_TEST_OBJECT } from "tests/fixtures/valid-data";
import { INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";

describe("YupSchema", () => {
    // The test cases for the static create method will cover initialization of this property
    // so these tests will only cover typing for now
    // also, I consider the jank of these tests to be the fault of limitations of
    describe("defaultValue property", () => {
        it("should be readonly", () => {
            expectTypeOf<Schema>()
                .pick("defaultValue")
                .toEqualTypeOf<{ readonly defaultValue?: Schema["defaultValue"] }>();
        });

        it("should be optional", () => {
            expectTypeOf<Schema>()
                .pick("defaultValue")
                .toMatchTypeOf<Partial<{ defaultValue: Schema["defaultValue"] }>>();
        });
    });

    // The test cases for the static create method will cover initialization of this property
    // so these tests will only cover typing for now
    describe("fields property", () => {
        it("should be readonly", () => {
            expectTypeOf<Schema>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: Schema["fields"] }>();
        });

        it("should be undefined for non-object schemas", () => {
            expectTypeOf<Schema<"primitive">>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: undefined }>();
        });

        it("should be a record of Schema instances for object schemas", () => {
            expectTypeOf<Schema<"object">>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: Record<string, Schema> }>();
        });

        it("should be a Schema instance for array schemas", () => {
            expectTypeOf<Schema<"array">>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: Schema }>();
        });

        it("should be undefined for unknown schemas", () => {
            expectTypeOf<Schema<"unknown">>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: undefined }>();
        });

        it("should be undefined for primitive schemas", () => {
            expectTypeOf<Schema<"primitive">>()
                .pick("fields")
                .toEqualTypeOf<{ readonly fields: undefined }>();
        });
    });

    describe("validate method", () => {
        let yupMock: yup_Schema<TestSchema>;

        describe("given valid data", () => {
            beforeEach(() => {
                yupMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("object");
                when(yupMock.validateSync(VALID_TEST_OBJECT, anything())).thenReturn();
            });

            it("should return true", () => {
                const schema = YupSchema.create(instance(yupMock));

                const result = schema.validate(VALID_TEST_OBJECT, {});

                expect(result).toBe(true);
            });
        });

        describe("when given invalid data", () => {
            beforeEach(() => {
                yupMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("object");
                when(yupMock.validateSync(INVALID_TEST_OBJECT, anything())).thenThrow(
                    new yup_ValidationError("invalid data")
                );
            });

            it("should throw a SchemaValidationError", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(() => schema.validate(INVALID_TEST_OBJECT, {})).toThrow(
                    SchemaValidationError
                );
            });
        });
    });

    describe("static create method", () => {
        describe("given an object schema", () => {
            let yupMock: yup_ObjectSchema<TestSchema>;
            let yupNestedMock: yup_Schema;

            beforeEach(() => {
                yupMock = mock(yup_ObjectSchema);
                yupNestedMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("object");
                when(yupNestedMock.type).thenReturn("string");
                when(yupMock.fields).thenReturn({
                    stringField: instance(yupNestedMock),
                    numberField: instance(yupNestedMock),
                    booleanField: instance(yupNestedMock),
                    objectField: instance(yupNestedMock),
                });
            });

            it("should return a Schema instance with type 'object'", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.type).toBe("object");
            });

            it("should return a Schema instance with fields populated with Schema instances", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.fields).toMatchObject({
                    stringField: expect.any(Schema),
                    numberField: expect.any(Schema),
                    booleanField: expect.any(Schema),
                    objectField: expect.any(Schema),
                });
            });
        });

        describe("given an array schema", () => {
            let yupMock: yup_ArraySchema<any, any>;
            let yupNestedMock: yup_Schema;

            beforeEach(() => {
                yupMock = mock(yup_ArraySchema);
                yupNestedMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("array");
                when(yupNestedMock.type).thenReturn("string");
                when(yupMock.innerType).thenReturn(instance(yupNestedMock));
            });

            it("should return a Schema instance with type 'array'", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.type).toBe("array");
            });

            it("should return a Schema instance with fields populated with Schema instance", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.fields).toBe(expect.any(Schema));
            });
        });

        describe("given a lazy schema", () => {
            let yupMock: yup_LazySchema<string>;
            let yupNestedMock: yup_Schema;

            beforeEach(() => {
                yupMock = mock(yup_LazySchema);
                yupNestedMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("lazy");
                when(yupNestedMock.type).thenReturn("string");
                when(yupMock.resolve(anything())).thenReturn(instance(yupNestedMock));
            });

            it("should return a Schema instance with the resolved schema", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.type).toBe("primitive");
            });
        });

        describe("given a non-object, non-array, non-lazy schema", () => {
            let yupMock: yup_Schema;

            beforeEach(() => {
                yupMock = mock(yup_Schema);
                when(yupMock.type).thenReturn("string");
            });

            it("should return a Schema instance with type 'primitive'", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.type).toBe("primitive");
            });

            it("should return a Schema instance with undefined fields", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(schema.fields).toBeUndefined();
            });
        });

        describe("should return an UnknownSchema given a reference", () => {
            const yupMock = mock(yup_Reference);
            when(yupMock.__isYupRef).thenReturn(true);
            const schema = YupSchema.create(instance(yupMock));

            expect(schema).toBeInstanceOf(UnknownSchema);
        });

        it("should throw a TypeError given an unsupported schema type", () => {
            const unsupportedSchema = {} as yup_Schema;

            expect(() => {
                YupSchema.create(unsupportedSchema);
            }).toThrow(TypeError);
        });
    });
});
