import { Handler } from "@/common";
import { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import { ISchemaValidation } from "@/Types/SchemaValidation";
import { ValidationHandler } from "@/ValidationHandler";

describe("PrimitiveSchemaValidation type", () => {
    it("should extend ISchemaValidation", () => {
        expectTypeOf<PrimitiveSchemaValidation<string>>().toMatchTypeOf<ISchemaValidation>();
    });

    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            const thing: PrimitiveSchemaValidation<string> = {} as any;
            //@ts-expect-error
            thing[Handler] = {} as any;
        });

        it("should be a ValidationHandler of the correct type", () => {
            expectTypeOf<PrimitiveSchemaValidation<string>>()
                .toHaveProperty(Handler)
                .toEqualTypeOf<ValidationHandler<string>>();
        });
    });

    describe("value property", () => {
        it("should be nullable", () => {
            expectTypeOf<PrimitiveSchemaValidation<string>>()
                .toHaveProperty("value")
                .toEqualTypeOf<string | null>();
        });

        it("should never be undefined", () => {
            expectTypeOf<PrimitiveSchemaValidation<string>>()
                .toHaveProperty("value")
                .not.toEqualTypeOf<string | null | undefined>();
        });

        it("should be writable using PrimitiveSchemaValidation type parameter", () => {
            const thing: PrimitiveSchemaValidation<string> = {} as any;
            thing.value = "test";
        });

        it("should be writable using null", () => {
            const thing: PrimitiveSchemaValidation<string> = {} as any;
            thing.value = null;
        });

        it("should be writable using undefined", () => {
            const thing: PrimitiveSchemaValidation<string> = {} as any;
            thing.value = undefined;
        });
    });

    describe("errors property", () => {
        it("should be readonly", () => {
            const thing: PrimitiveSchemaValidation<string> = {} as any;
            //@ts-expect-error
            thing.errors = [] as any;
        });

        it("should be a ReadonlyArray<string>", () => {
            expectTypeOf<PrimitiveSchemaValidation<string>>()
                .toHaveProperty("errors")
                .toEqualTypeOf<ReadonlyArray<string>>();

            const thing: PrimitiveSchemaValidation<string> = {} as any;
            //@ts-expect-error
            thing.errors.push("test");
        });
    });

    describe("reset method", () => {
        it("should not return anything", () => {
            expectTypeOf<PrimitiveSchemaValidation<string>>()
                .toHaveProperty("reset")
                .returns.toBeVoid();
        });

        describe("parameter", () => {
            it("should be optional", () => {
                expectTypeOf<PrimitiveSchemaValidation<string>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith();
            });

            it("should allow the same type as the PrimitiveSchemaValidation type parameter", () => {
                expectTypeOf<PrimitiveSchemaValidation<string>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith("test");
            });

            it("should allow null", () => {
                expectTypeOf<PrimitiveSchemaValidation<string>>()
                    .toHaveProperty("reset")
                    .toBeCallableWith(null);
            });
        });
    });
});
