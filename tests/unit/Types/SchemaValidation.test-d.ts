import type { ISchemaValidation, SchemaValidation } from "@/Types/SchemaValidation";
import type { ArraySchemaValidation } from "@/Types/ArraySchemaValidation";
import type { ObjectSchemaValidation } from "@/Types/ObjectSchemaValidation";
import type { PrimitiveSchemaValidation } from "@/Types/PrimitiveSchemaValidation";
import type { ValidationHandler } from "@/ValidationHandler";
import { Handler } from "@/common";

describe("ISchemaValidation type", () => {
    describe("HandlerInstance symbol property", () => {
        it("should be readonly", () => {
            expectTypeOf<ISchemaValidation>().pick(Handler).not.toEqualTypeOf<{
                set [Handler](value: ValidationHandler<unknown>);
            }>();
        });

        it("should be a ValidationHandler of unknown type", () => {
            expectTypeOf<ISchemaValidation>().pick(Handler).toEqualTypeOf<{
                readonly [Handler]: ValidationHandler<unknown>;
            }>();
        });
    });

    describe("value property", () => {
        it("should be writable", () => {
            expectTypeOf<ISchemaValidation>().pick("value").toEqualTypeOf<{
                get value(): unknown;
                set value(value: unknown);
            }>();
        });

        it("should be of type unknown", () => {
            expectTypeOf<ISchemaValidation>().toHaveProperty("value").toBeUnknown();
        });
    });

    describe("errors property", () => {
        it("should be readonly", () => {
            expectTypeOf<ISchemaValidation>().pick("errors").not.toEqualTypeOf<{
                set errors(value: Iterable<string>);
            }>();
        });

        it("should be an Iterable<string>", () => {
            expectTypeOf<ISchemaValidation>().pick("errors").toEqualTypeOf<{
                readonly errors: Iterable<string>;
            }>();
        });
    });

    describe("isValid property", () => {
        it("should be readonly", () => {
            expectTypeOf<ISchemaValidation>().pick("isValid").not.toEqualTypeOf<{
                set isValid(value: boolean);
            }>();
        });

        it("should be a boolean", () => {
            expectTypeOf<ISchemaValidation>().pick("isValid").toEqualTypeOf<{
                readonly isValid: boolean;
            }>();
        });
    });

    describe("isDirty property", () => {
        it("should be readonly", () => {
            expectTypeOf<ISchemaValidation>().pick("isDirty").not.toEqualTypeOf<{
                set isDirty(value: boolean);
            }>();
        });

        it("should be a boolean", () => {
            expectTypeOf<ISchemaValidation>().pick("isDirty").toEqualTypeOf<{
                readonly isDirty: boolean;
            }>();
        });
    });

    describe("validate method", () => {
        it("should return a boolean", () => {
            expectTypeOf<ISchemaValidation>().toHaveProperty("validate").returns.toBeBoolean();
        });

        it("should not have any parameters", () => {
            expectTypeOf<ISchemaValidation>().toHaveProperty("validate").toBeCallableWith();
        });
    });

    describe("reset method", () => {
        it("should not return anything", () => {
            expectTypeOf<ISchemaValidation>().toHaveProperty("reset").returns.toBeVoid();
        });

        describe("parameter", () => {
            it("should be optional", () => {
                expectTypeOf<ISchemaValidation>().toHaveProperty("reset").toBeCallableWith();
            });

            it("should be of the type unknown", () => {
                expectTypeOf<ISchemaValidation>()
                    .toHaveProperty("reset")
                    .parameter(0)
                    .toBeUnknown();
            });
        });
    });
});

describe("SchemaValidation type", () => {
    it("should be an ISchemaValidation when the generic type is unknown", () => {
        expectTypeOf<SchemaValidation>().toEqualTypeOf<ISchemaValidation>();
    });

    it("should be an ArraySchemaValidation when the generic type is an array", () => {
        expectTypeOf<SchemaValidation<number[]>>().toEqualTypeOf<ArraySchemaValidation<number[]>>();
    });

    it("should be an ObjectSchemaValidation when the generic type is an object", () => {
        expectTypeOf<SchemaValidation<TestSchema>>().toEqualTypeOf<
            ObjectSchemaValidation<TestSchema>
        >();
    });

    it("should be a PrimitiveSchemaValidation when the generic type is not an array or object", () => {
        expectTypeOf<SchemaValidation<number>>().toEqualTypeOf<PrimitiveSchemaValidation<number>>();
    });
});
