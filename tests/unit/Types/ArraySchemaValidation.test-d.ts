import {
    ArraySchemaValidation,
    ArraySchemaValidationErrors,
    ArraySchemaValidationFields,
} from "@/Types/ArraySchemaValidation";
import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";
import { HandlerInstance } from "@/common";

describe("ArraySchemaValidation type", () => {
    it("should extend ISchemaValidation", () => {
        expectTypeOf<ArraySchemaValidation<number[]>>().toMatchTypeOf<ISchemaValidation>();
    });

    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing[HandlerInstance] = {} as any;
        });

        it("should be a ValidationHandler of the correct type", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty(HandlerInstance)
                .toEqualTypeOf<ValidationHandler<number[]>>();
        });
    });

    describe("fields property", () => {
        it("should be readonly", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing.fields = {};
        });

        it("should be of type ArraySchemaValidationFields of the correct type", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("fields")
                .toEqualTypeOf<ArraySchemaValidationFields<number[]>>();
        });
    });

    describe("errors property", () => {
        it("should be readonly", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing.errors = [];
        });

        it("should be of type ArraySchemaValidationErrors of the correct type", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("errors")
                .toEqualTypeOf<ArraySchemaValidationErrors<number[]>>();
        });
    });

    describe("reset method", () => {
        it("should not return anything", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("reset")
                .returns.toBeVoid();
        });

        describe("parameter", () => {
            it("should be optional", () => {
                expectTypeOf<ArraySchemaValidation<number[]>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith();
            });

            it("should allow the same type as the ArraySchemaValidation type parameter", () => {
                expectTypeOf<ArraySchemaValidation<number[]>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith([1, 2, 3]);
            });
        });
    });
});

describe("ArraySchemaValidationFields type", () => {
    it("should have number keys", () => {
        expectTypeOf<ArraySchemaValidationFields<number[]>>().toHaveProperty(0);
    });

    it("should have readonly properties", () => {
        const thing: ArraySchemaValidationFields<number[]> = {} as any;
        //@ts-expect-error
        thing[0] = {} as any;
    });

    it("should have SchemaValidation properties of the same type as the ArraySchemaValidation array type", () => {
        expectTypeOf<ArraySchemaValidationFields<number[]>>()
            .toHaveProperty(0)
            .toEqualTypeOf<SchemaValidation<number>>();
    });
});

describe("ArraySchemaValidationErrors type", () => {
    it("should be Iterable<string>", () => {
        expectTypeOf<ArraySchemaValidationErrors<number[]>>().toMatchTypeOf<Iterable<string>>();
    });

    it("should have readonly properties", () => {
        const thing: ArraySchemaValidationErrors<number[]> = {} as any;
        //@ts-expect-error
        thing.push("test" as any);
        //@ts-expect-error
        thing[0] = "" as any;
    });

    it("should have properties of type SchemaValidation[errors] of the same type as the array", () => {
        expectTypeOf<ArraySchemaValidationErrors<number[]>>()
            .toHaveProperty(0)
            .toEqualTypeOf<SchemaValidation<number>["errors"]>();
    });
});
