import { UnknownSchema } from "@/Schema/UnknownSchema";

describe("UnknownSchema", () => {
    it("should return true when calling validate", () => {
        const schema = new UnknownSchema();

        expect(schema.validate()).toBe(true);
    });
});
