describe("YupSchema", () => {
    describe("defaultValue property", () => {});

    describe("fields property", () => {
        it("should be undefined for non-object schemas", () => {});

        it("should be an object with the same keys as the schema for object schemas", () => {});

        it("should be an object with numeric keys for array schemas", () => {});
    });

    describe("validate method", () => {
        it("should return true if data is valid", () => {});

        it("should throw a SchemaValidationError if data is invalid", () => {});
    });

    describe("static create method", () => {
        describe("given an object schema", () => {
            it("should return a Schema instance with type 'object'", () => {});

            it("should return a Schema instance with fields populated with Schema instances", () => {});
        });

        describe("given an array schema", () => {
            it("should return a Schema instance with type 'array'", () => {});

            // Not sure that an array schema really needs to have fields if it will always be an empty object
            it("should return a Schema instance with empty fields", () => {});
        });

        describe("given a lazy schema", () => {
            it("should return a Schema instance with the resolved schema", () => {});
        });

        describe("given a non-object, non-array, non-lazy schema", () => {
            it("should return a Schema instance with type 'primitive'", () => {});

            it("should return a Schema instance with undefined fields", () => {});
        });

        it("should throw a TypeError given an unsupported schema type", () => {});
    });
});
