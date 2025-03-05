import { UnknownSchema } from "@/Schema/UnknownSchema";

describe("UnknownSchema", () => {
    describe("fields property", () => {
        it("should be undefined", () => {
            const schema = new UnknownSchema();

            expect(schema.fields).toBeUndefined();
        });
    });

    describe("defaultValue property", () => {
        it("should be undefined", () => {
            const schema = new UnknownSchema();

            expect(schema.defaultValue).toBeUndefined();
        });
    });

    describe("validate method", () => {
        it("should return true", () => {
            const schema = new UnknownSchema();

            expect(schema.validate()).toBe(true);
        });
    });

    describe("validateRoot method", () => {
        it("should return true", () => {
            const schema = new UnknownSchema();

            expect(schema.validateRoot()).toBe(true);
        });
    });
});
