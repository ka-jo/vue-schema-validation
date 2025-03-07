import { HandlerInstance } from "@/common";
import {
    ObjectSchemaValidation,
    ObjectSchemaValidationErrors,
    ObjectSchemaValidationFields,
    ObjectSchemaValidationValue,
} from "@/Types/ObjectSchemaValidation";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";

describe("ObjectSchemaValidation type", () => {
    it("should extend ISchemaValidation", () => {
        expectTypeOf<ObjectSchemaValidation<TestSchema>>().toMatchTypeOf<ISchemaValidation>();
    });

    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            const thing: ObjectSchemaValidation<TestSchema> = {} as any;
            // @ts-expect-error
            thing[HandlerInstance] = {} as any;
        });

        it("should be a ValidationHandler of the correct type", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty(HandlerInstance)
                .toEqualTypeOf<ValidationHandler<TestSchema>>();
        });
    });

    describe("value property", () => {
        it("should be writable", () => {
            // unfortunately, this is not easy to test with the vitest typing assertions
            // Using toEqualTypeOf means we would have to add every property of ObjectSchemaValidation
            // but using `Pick` on value doesn't work because value is a getter/setter so it will come
            // back from `Pick` as property of type returned by the getter and the setter type is lost
            const thing: ObjectSchemaValidation<TestSchema> = {} as any;
            thing.value = {} as any;
        });

        it("should be writable with a partial", () => {
            const thing: ObjectSchemaValidation<TestSchema> = {} as any;
            thing.value = {
                stringField: "test",
                objectField: {
                    nestedStringField: "test",
                },
            };
        });

        it("should be type ObjectSchemaValidationValue of the correct type", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty("value")
                .toEqualTypeOf<ObjectSchemaValidationValue<TestSchema>>();
        });

        it("should never be nullable", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty("value")
                .not.toEqualTypeOf<ObjectSchemaValidationValue<TestSchema> | null>();
        });
    });

    describe("fields property", () => {
        it("should be readonly", () => {
            const thing: ObjectSchemaValidation<TestSchema> = {} as any;
            // @ts-expect-error
            thing.fields = {} as any;
        });

        it("should be of type ObjectSchemaValidationFields of the correct type", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty("fields")
                .toEqualTypeOf<ObjectSchemaValidationFields<TestSchema>>();
        });
    });

    describe("errors property", () => {
        it("should be readonly", () => {
            const thing: ObjectSchemaValidation<TestSchema> = {} as any;
            // @ts-expect-error
            thing.errors = {} as any;
        });

        it("should be of type ObjectSchemaValidationErrors of the correct type", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty("errors")
                .toEqualTypeOf<ObjectSchemaValidationErrors<TestSchema>>();
        });
    });

    describe("reset method", () => {
        it("should not return anything", () => {
            expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                .toHaveProperty("reset")
                .returns.toBeVoid();
        });

        describe("parameter", () => {
            it("should be optional", () => {
                expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith();
            });

            it("should allow a DeepPartial of the ObjectSchemaValidation type parameter ", () => {
                expectTypeOf<ObjectSchemaValidation<TestSchema>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith({
                        objectField: { nestedStringField: "test" },
                    });
            });
        });
    });
});

describe("ObjectSchemaValidationValue type", () => {
    it("should have a property for each key in the generic type", () => {
        expectTypeOf<ObjectSchemaValidationValue<TestSchema>>().toHaveProperty("numberField");
        expectTypeOf<ObjectSchemaValidationValue<TestSchema>>().toHaveProperty("stringField");
        expectTypeOf<ObjectSchemaValidationValue<TestSchema>>().toHaveProperty("booleanField");
        expectTypeOf<ObjectSchemaValidationValue<TestSchema>>().toHaveProperty("objectField");
    });

    it("should never have undefined values for optional properties", () => {
        expectTypeOf<ObjectSchemaValidationValue<{ optionalProperty?: string }>>().toEqualTypeOf<{
            optionalProperty: string | null;
        }>();

        expectTypeOf<
            ObjectSchemaValidationValue<{ optionalProperty?: string }>
        >().not.toEqualTypeOf<{
            optionalProperty: string | null | undefined;
        }>();
    });

    it("should have nullable type for primitive properties", () => {
        expectTypeOf<
            ObjectSchemaValidationValue<{
                string: string;
                number: number;
                boolean: boolean;
                bigint: bigint;
                symbol: symbol;
            }>
        >().toEqualTypeOf<{
            string: string | null;
            number: number | null;
            boolean: boolean | null;
            bigint: bigint | null;
            symbol: symbol | null;
        }>();
    });

    describe("object properties", () => {
        it("should be of type ObjectSchemaValidationValue", () => {
            expectTypeOf<ObjectSchemaValidationValue<TestSchema>>()
                .toHaveProperty("objectField")
                .toEqualTypeOf<ObjectSchemaValidationValue<NestedObject>>();
        });

        it("should never be nullable", () => {
            expectTypeOf<ObjectSchemaValidationValue<TestSchema>>()
                .toHaveProperty("objectField")
                .not.toEqualTypeOf<ObjectSchemaValidationValue<NestedObject> | null>();
        });
    });

    describe("array properties", () => {
        it("should be of type array of the correct type", () => {
            expectTypeOf<ObjectSchemaValidationValue<{ arrayField: string[] }>>()
                .toHaveProperty("arrayField")
                .toEqualTypeOf<Array<string>>();
        });

        it("should never be nullable", () => {
            expectTypeOf<ObjectSchemaValidationValue<{ arrayField: string[] }>>()
                .toHaveProperty("arrayField")
                .not.toEqualTypeOf<Array<string> | null>();
        });
    });
});

describe("ObjectSchemaValidationFields type", () => {
    it("should have a property for each key in the generic type", () => {
        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>().toHaveProperty("numberField");
        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>().toHaveProperty("stringField");
        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>().toHaveProperty("booleanField");
        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>().toHaveProperty("objectField");
    });

    it("should never have undefined values for optional properties of the generic type", () => {
        expectTypeOf<ObjectSchemaValidationFields<{ optionalProperty?: string }>>()
            .toHaveProperty("optionalProperty")
            .toEqualTypeOf<PrimitiveSchemaValidation<string>>();

        expectTypeOf<ObjectSchemaValidationFields<{ optionalProperty?: string }>>()
            .toHaveProperty("optionalProperty")
            .not.toEqualTypeOf<PrimitiveSchemaValidation<string> | undefined>();
    });

    it("should have properties of type SchemaValidation of the correct type", () => {
        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>()
            .toHaveProperty("stringField")
            .toEqualTypeOf<SchemaValidation<string>>();

        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>()
            .toHaveProperty("numberField")
            .toEqualTypeOf<SchemaValidation<number>>();

        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>()
            .toHaveProperty("booleanField")
            .toEqualTypeOf<SchemaValidation<boolean>>();

        expectTypeOf<ObjectSchemaValidationFields<TestSchema>>()
            .toHaveProperty("objectField")
            .toEqualTypeOf<SchemaValidation<NestedObject>>();
    });
});

describe("ObjectSchemaValidationErrors type", () => {
    it("should have a property for each key in the generic type", () => {
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>().toHaveProperty("numberField");
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>().toHaveProperty("stringField");
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>().toHaveProperty("booleanField");
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>().toHaveProperty("objectField");
    });

    it("should never have undefined values for optional properties of the generic type", () => {
        expectTypeOf<ObjectSchemaValidationErrors<{ optionalProperty?: string }>>()
            .toHaveProperty("optionalProperty")
            .toEqualTypeOf<ReadonlyArray<string>>();

        expectTypeOf<ObjectSchemaValidationErrors<{ optionalProperty?: string }>>()
            .toHaveProperty("optionalProperty")
            .not.toEqualTypeOf<ReadonlyArray<string> | undefined>();
    });

    it("should have readonly properties", () => {
        const thing: ObjectSchemaValidationErrors<TestSchema> = {} as any;
        // @ts-expect-error
        thing.numberField = [] as any;
    });

    it("should have $root property", () => {
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>()
            .toHaveProperty("$root")
            .toEqualTypeOf<ReadonlyArray<string>>();
    });

    it("should have readonly $root property", () => {
        const thing: ObjectSchemaValidationErrors<TestSchema> = {} as any;
        // @ts-expect-error
        thing.$root = [] as any;
    });

    it("should have properties of type SchemaValidation[errors] of the correct type", () => {
        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>()
            .toHaveProperty("stringField")
            .toEqualTypeOf<SchemaValidation<string>["errors"]>();

        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>()
            .toHaveProperty("numberField")
            .toEqualTypeOf<SchemaValidation<number>["errors"]>();

        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>()
            .toHaveProperty("booleanField")
            .toEqualTypeOf<SchemaValidation<boolean>["errors"]>();

        expectTypeOf<ObjectSchemaValidationErrors<TestSchema>>()
            .toHaveProperty("objectField")
            .toEqualTypeOf<SchemaValidation<NestedObject>["errors"]>();
    });
});
