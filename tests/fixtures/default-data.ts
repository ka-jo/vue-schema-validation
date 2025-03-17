export const DEFAULT_STRING = "default";
export const DEFAULT_NUMBER = 99;
export const DEFAULT_BOOLEAN = true;

export const DEFAULT_NESTED_OBJECT = Object.freeze({
    nestedStringField: DEFAULT_STRING,
    nestedNumberField: DEFAULT_NUMBER,
    nestedBooleanField: DEFAULT_BOOLEAN,
});

export const DEFAULT_TEST_OBJECT = Object.freeze({
    stringField: DEFAULT_STRING,
    numberField: DEFAULT_NUMBER,
    booleanField: DEFAULT_BOOLEAN,
    objectField: DEFAULT_NESTED_OBJECT,
});

export const DEFAULT_TUPLE: [string, number, boolean] = Object.freeze([
    DEFAULT_STRING,
    DEFAULT_NUMBER,
    DEFAULT_BOOLEAN,
]) as any;
