//It's important that these values are different than the default values exported from default-data.ts

export const VALID_STRING = "valid";
export const VALID_NUMBER = 0;
export const VALID_BOOLEAN = true;

export const VALID_NESTED_OBJECT: Readonly<NestedObject> = Object.freeze({
    nestedRequiredField: "nested valid required field",
    nestedStringField: "nested valid string field",
    nestedNumberField: 0,
    nestedBooleanField: false,
});

export const VALID_TEST_OBJECT: Readonly<TestSchema> = Object.freeze({
    requiredField: "valid required field",
    stringField: "valid string field",
    numberField: 0,
    booleanField: false,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: "valid lazy string field",
    lazyNumberField: 0,
    lazyBooleanField: false,
});
