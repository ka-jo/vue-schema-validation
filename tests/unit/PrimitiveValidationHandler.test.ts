import { mock } from "ts-mockito";
import { Schema } from "@/Schema/Schema";

describe("PrimitiveValidationHandler", () => {
    let schemaMock: Schema<TestSchema>;

    beforeEach(() => {
        schemaMock = mock(Schema);
    });

    describe("value property", () => {
        // This test ensures that the value property cannot be set to a new ref, not that the ref value can't be set
        it("should be readonly", () => {});

        it("should be a Vue ref", () => {});

        describe("initialization", () => {
            it("should initialize with provided value", () => {});

            it("should initialize with schema default if no value provided", () => {});

            it("should initialize with null if no value provided and no schema default", () => {});
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {});

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        it("should be readonly", () => {});

        it("should be iterable", () => {});

        it("should initialize as an empty iterable", () => {});
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {});

        // Because we've established it's a ref by this point, test descriptions should read as if it's a regular property

        it("should be readonly", () => {});

        it("should initialize to false", () => {});
    });

    describe("fields property", () => {
        it("should be undefined", () => {});
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            it("should return true", () => {});

            it("should set isValid to true", () => {});

            it("should reset errors", () => {});
        });

        describe("given invalid data", () => {
            it("should return false", () => {});

            it("should set isValid to false", () => {});

            it("should populate errors", () => {});
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset handler value to provided value", () => {});
        });

        describe("given no value", () => {
            it("should reset handler value to initial value", () => {});

            it("should reset handler value to schema default if no initial value", () => {});
        });
    });
});
