import {
    Schema as yup_Schema,
    ValidationError as yup_ValidationError,
    ObjectSchema as yup_ObjectSchema,
    ArraySchema as yup_ArraySchema,
    LazySchema as yup_LazySchema,
    Reference as yup_Reference,
} from "yup";
import { anything, instance, mock, when } from "ts-mockito";

import { Schema, YupSchema, UnknownSchema, SchemaValidationError } from "@/Schema";

import { VALID_STRING, VALID_TEST_OBJECT } from "tests/fixtures/valid-data";
import { INVALID_STRING, INVALID_TEST_OBJECT } from "tests/fixtures/invalid-data";

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

        beforeEach(() => {
            yupMock = mock(yup_Schema);
            when(yupMock.type).thenReturn("string");
            when(yupMock.__isYupSchema__).thenReturn(true);
            when(yupMock.spec).thenReturn({ default: undefined } as any);
        });

        describe("given valid data", () => {
            beforeEach(() => {
                when(yupMock.validateSync(VALID_STRING, anything())).thenReturn();
            });

            it("should return true", () => {
                const schema = YupSchema.create(instance(yupMock));

                const result = schema.validate(VALID_STRING, {});

                expect(result).toBe(true);
            });
        });

        describe("when given invalid data", () => {
            beforeEach(() => {
                when(yupMock.validateSync(INVALID_STRING, anything())).thenThrow(
                    new yup_ValidationError("invalid data")
                );
            });

            it("should throw a SchemaValidationError", () => {
                const schema = YupSchema.create(instance(yupMock));

                expect(() => schema.validate(INVALID_STRING, {})).toThrow(SchemaValidationError);
            });
        });
    });

    describe("static create method", () => {
        let yupStringMock: yup_Schema;

        beforeEach(() => {
            yupStringMock = mock(yup_Schema);
            when(yupStringMock.type).thenReturn("string");
            when(yupStringMock.__isYupSchema__).thenReturn(true);
            when(yupStringMock.spec).thenReturn({ default: undefined } as any);
        });

        describe("given a non-object, non-array, non-lazy schema", () => {
            it("should return a Schema instance with type 'primitive'", () => {
                const schema = YupSchema.create(instance(yupStringMock));

                expect(schema.type).toBe("primitive");
            });

            it("should return a Schema instance with undefined fields", () => {
                const schema = YupSchema.create(instance(yupStringMock));

                expect(schema.fields).toBeUndefined();
            });
        });

        describe("given an object schema", () => {
            let yupObjectMock: yup_ObjectSchema<TestSchema>;

            beforeEach(() => {
                yupObjectMock = mock(yup_ObjectSchema);
                when(yupObjectMock.type).thenReturn("object");
                when(yupObjectMock.spec).thenReturn({ default: undefined } as any);
                when(yupObjectMock.fields).thenReturn({
                    stringField: instance(yupStringMock),
                    numberField: instance(yupStringMock),
                    booleanField: instance(yupStringMock),
                    objectField: instance(yupStringMock),
                });
            });

            it("should return a Schema instance with type 'object'", () => {
                const schema = YupSchema.create(instance(yupObjectMock));

                expect(schema.type).toBe("object");
            });

            it("should return a Schema instance with fields populated with Schema instances", () => {
                const schema = YupSchema.create(instance(yupObjectMock));

                expect(schema.fields).toMatchObject({
                    stringField: expect.any(Schema),
                    numberField: expect.any(Schema),
                    booleanField: expect.any(Schema),
                    objectField: expect.any(Schema),
                });
            });
        });

        describe("given an array schema", () => {
            let yupArrayMock: yup_ArraySchema<any, any>;

            beforeEach(() => {
                yupArrayMock = mock(yup_ArraySchema);
                when(yupArrayMock.innerType).thenReturn(instance(yupStringMock));
                when(yupArrayMock.type).thenReturn("array");
                when(yupArrayMock.spec).thenReturn({ default: undefined } as any);
            });

            it("should return a Schema instance with type 'array'", () => {
                const schema = YupSchema.create(instance(yupArrayMock));

                expect(schema.type).toBe("array");
            });

            it("should return a Schema instance with fields populated with Schema instance", () => {
                const schema = YupSchema.create(instance(yupArrayMock));

                expect(schema.fields).toBeInstanceOf(Schema);
            });
        });

        describe("given a lazy schema", () => {
            let yupLazyMock: yup_LazySchema<string>;

            beforeEach(() => {
                yupLazyMock = mock(yup_LazySchema);
                when(yupLazyMock.type).thenReturn("lazy");
                when(yupLazyMock.resolve(anything())).thenReturn(instance(yupStringMock));
            });

            it("should return a Schema instance with the resolved schema", () => {
                const schema = YupSchema.create(instance(yupLazyMock));

                expect(schema.type).toBe("primitive");
            });
        });

        it("should return an UnknownSchema given a reference", () => {
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
