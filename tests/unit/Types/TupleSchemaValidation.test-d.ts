import { HandlerInstance } from "@/common";
import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import {
    TupleSchemaValidation,
    TupleSchemaValidationErrors,
    TupleSchemaValidationFields,
} from "@/Types/TupleSchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";

describe("TupleSchemaValidation type", () => {
    it("should extend ISchemaValidation", () => {
        expectTypeOf<TupleSchemaValidation<[number, string]>>().toMatchTypeOf<ISchemaValidation>();
    });

    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            const thing: TupleSchemaValidation<[number, string]> = {} as any;
            //@ts-expect-error
            thing[HandlerInstance] = {} as any;
        });

        it("should be a ValidationHandler of the correct type", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty(HandlerInstance)
                .toEqualTypeOf<ValidationHandler<[number, string]>>();
        });
    });

    describe("value property", () => {
        it("should be of the type of the generic", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty("value")
                .toEqualTypeOf<[number, string]>();
        });

        it("should be writable using TupleSchemaValidation type parameter", () => {
            const thing: TupleSchemaValidation<[number, string]> = {} as any;
            thing.value = [1, "test"];
        });

        it("should be writable with a partial", () => {
            const thing: TupleSchemaValidation<[number, string]> = {} as any;
            thing.value = [1];
        });

        it("should never be nullable", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty("value")
                .not.toEqualTypeOf<[number, string] | null>();
        });
    });

    describe("fields property", () => {
        it("should be readonly", () => {
            const thing: TupleSchemaValidation<[number, string]> = {} as any;
            //@ts-expect-error
            thing.fields = {} as any;
        });

        it("should be of type TupleSchemaValidationFields with the correct type", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty("fields")
                .toEqualTypeOf<TupleSchemaValidationFields<[number, string]>>();
        });
    });

    describe("errors property", () => {
        it("should be readonly", () => {
            const thing: TupleSchemaValidation<[number, string]> = {} as any;
            //@ts-expect-error
            thing.errors = {} as any;
        });

        it("should be of type TupleSchemaValidationErrors with the correct type", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty("errors")
                .toEqualTypeOf<TupleSchemaValidationErrors<[number, string]>>();
        });
    });

    describe("reset method", () => {
        it("should not return anything", () => {
            expectTypeOf<TupleSchemaValidation<[number, string]>>()
                .toHaveProperty("reset")
                .returns.toBeVoid();
        });

        describe("parameter", () => {
            it("should be optional", () => {
                expectTypeOf<TupleSchemaValidation<[number, string]>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith();
            });

            it("should allow the same type as the TupleSchemaValidation type parameter", () => {
                expectTypeOf<TupleSchemaValidation<[number, string]>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith([1, "test"]);
            });

            it("should allow a partial of the same type as the TupleSchemaValidation type parameter", () => {
                expectTypeOf<TupleSchemaValidation<[number, string]>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith([undefined, "test"]);
            });
        });
    });
});

describe("TupleSchemaValidationFields type", () => {
    type TestTuple = [number, string, boolean, TestSchema];

    it("should have number keyed properties for each value in the generic type", () => {
        expectTypeOf<TupleSchemaValidationFields<TestTuple>>().toHaveProperty(0);
        expectTypeOf<TupleSchemaValidationFields<TestTuple>>().toHaveProperty(1);
        expectTypeOf<TupleSchemaValidationFields<TestTuple>>().toHaveProperty(2);
        expectTypeOf<TupleSchemaValidationFields<TestTuple>>().toHaveProperty(3);
    });

    it("should have properties of type SchemaValidation with the correct type", () => {
        expectTypeOf<TupleSchemaValidationFields<TestTuple>>()
            .toHaveProperty(0)
            .toEqualTypeOf<SchemaValidation<number>>();

        expectTypeOf<TupleSchemaValidationFields<TestTuple>>()
            .toHaveProperty(1)
            .toEqualTypeOf<SchemaValidation<string>>();

        expectTypeOf<TupleSchemaValidationFields<TestTuple>>()
            .toHaveProperty(2)
            .toEqualTypeOf<SchemaValidation<boolean>>();

        expectTypeOf<TupleSchemaValidationFields<TestTuple>>()
            .toHaveProperty(3)
            .toEqualTypeOf<SchemaValidation<TestSchema>>();
    });

    it("should have readonly properties", () => {
        const thing: TupleSchemaValidationFields<TestTuple> = {} as any;
        //@ts-expect-error
        thing[0] = {} as any;
    });
});

describe("TupleSchemaValidationErrors type", () => {
    type TestTuple = [number, string, boolean, TestSchema];

    it("should be Iterable<string>", () => {
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>().toMatchTypeOf<Iterable<string>>();
    });

    // I believe that because the resulting type is an object, but not an array, the typing assertions expect
    // the properties to be strings. Either way, when indexing an object in JS, obj['0'] is the same as obj[0],
    // so this is a non-issue.
    it("should have properties for each value in the generic type", () => {
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>().toHaveProperty("0");
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>().toHaveProperty("1");
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>().toHaveProperty("2");
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>().toHaveProperty("3");
    });

    it("should have properties of type SchemaValidation[errors] with the correct type", () => {
        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>()
            .toHaveProperty("0")
            .toEqualTypeOf<SchemaValidation<number>["errors"]>();

        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>()
            .toHaveProperty("1")
            .toEqualTypeOf<SchemaValidation<string>["errors"]>();

        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>()
            .toHaveProperty("2")
            .toEqualTypeOf<SchemaValidation<boolean>["errors"]>();

        expectTypeOf<TupleSchemaValidationErrors<TestTuple>>()
            .toHaveProperty("3")
            .toEqualTypeOf<SchemaValidation<TestSchema>["errors"]>();
    });

    it("should have readonly properties", () => {
        const thing: TupleSchemaValidationErrors<TestTuple> = {} as any;
        //@ts-expect-error
        thing[0] = "" as any;
    });
});
