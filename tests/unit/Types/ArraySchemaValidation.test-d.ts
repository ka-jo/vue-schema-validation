import { ArraySchemaValidation, ArraySchemaValidationErrors } from "@/Types/ArraySchemaValidation";
import { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";
import { Handler } from "@/common";

describe("ArraySchemaValidation type", () => {
    it("should extend ISchemaValidation", () => {
        expectTypeOf<ArraySchemaValidation<number[]>>().toMatchTypeOf<ISchemaValidation>();
    });

    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing[Handler] = {} as any;
        });

        it("should be a ValidationHandler of the correct type", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty(Handler)
                .toEqualTypeOf<ValidationHandler<number[]>>();
        });
    });

    describe("fields property", () => {
        it("should be readonly", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing.fields = {};
        });

        it("should have number keys", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("fields")
                .toHaveProperty(0);
        });

        it("should be iterable", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("fields")
                .toMatchTypeOf<Iterable<SchemaValidation<number>>>();
        });

        it("should have readonly properties", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing.fields[0] = {} as any;
        });

        it("should have SchemaValidation properties of the same type as the ArraySchemaValidation array type", () => {
            expectTypeOf<ArraySchemaValidation<number[]>>()
                .toHaveProperty("fields")
                .toHaveProperty(0)
                .toEqualTypeOf<SchemaValidation<number>>();
        });

        it("should not have array methods that mutate the array", () => {
            const thing: ArraySchemaValidation<number[]> = {} as any;
            //@ts-expect-error
            thing.fields.push(1);
            //@ts-expect-error
            thing.fields.pop();
            //@ts-expect-error
            thing.fields.shift();
            //@ts-expect-error
            thing.fields.unshift(1);
            //@ts-expect-error
            thing.fields.splice(0, 1);
            //@ts-expect-error
            thing.fields.sort();
            //@ts-expect-error
            thing.fields.reverse();
            //@ts-expect-error
            thing.fields.fill(1);
            //@ts-expect-error
            thing.fields.copyWithin(0, 1);
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

    it("should have $root property", () => {
        expectTypeOf<ArraySchemaValidationErrors<number[]>>()
            .toHaveProperty("$root")
            .toEqualTypeOf<ReadonlyArray<string>>();
    });

    it("should have readonly $root property", () => {
        const thing: ArraySchemaValidationErrors<number[]> = {} as any;
        //@ts-expect-error
        thing.$root = [] as any;
    });

    it("should have properties of type SchemaValidation[errors] of the same type as the array", () => {
        expectTypeOf<ArraySchemaValidationErrors<number[]>>()
            .toHaveProperty(0)
            .toEqualTypeOf<SchemaValidation<number>["errors"]>();
    });
});
