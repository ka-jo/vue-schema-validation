export const DEFAULT_STRING = "default";
export const DEFAULT_NUMBER = 99;
export const DEFAULT_BOOLEAN = true;

export const DEFAULT_NESTED_OBJECT: Readonly<NestedObject> = Object.freeze({
    nestedRequiredField: "nested default",
    nestedOptionalField: null,
    nestedStringField: "nested default",
    nestedNumberField: 99_99,
    nestedBooleanField: true,
});

export const DEFAULT_TEST_OBJECT: Readonly<TestSchema> = Object.freeze({
    requiredField: DEFAULT_STRING,
    optionalField: null,
    stringField: DEFAULT_STRING,
    numberField: DEFAULT_NUMBER,
    booleanField: DEFAULT_BOOLEAN,
    objectField: DEFAULT_NESTED_OBJECT,
    lazyObjectField: DEFAULT_NESTED_OBJECT,
    lazyStringField: DEFAULT_STRING,
    lazyNumberField: DEFAULT_NUMBER,
    lazyBooleanField: DEFAULT_BOOLEAN,
});
