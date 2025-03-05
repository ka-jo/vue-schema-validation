//It's important that these values are different than the default values exported from default-data.ts

export const VALID_STRING = "valid";
export const VALID_NUMBER = 0;
export const VALID_BOOLEAN = true;

export const VALID_NESTED_OBJECT = Object.freeze({
    nestedStringField: VALID_STRING,
    nestedNumberField: VALID_NUMBER,
    nestedBooleanField: VALID_BOOLEAN,
});

export const VALID_TEST_OBJECT = Object.freeze({
    stringField: VALID_STRING,
    numberField: VALID_NUMBER,
    booleanField: VALID_BOOLEAN,
    objectField: VALID_NESTED_OBJECT,
});
