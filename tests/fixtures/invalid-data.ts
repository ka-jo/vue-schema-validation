import { VALID_BOOLEAN, VALID_NESTED_OBJECT, VALID_NUMBER, VALID_STRING } from "./valid-data";

export const INVALID_STRING: string = 0 as any;
export const INVALID_NUMBER: number = "invalid" as any;
export const INVALID_BOOLEAN: boolean = 0 as any;

export const INVALID_NESTED_OBJECT = Object.freeze({
    nestedStringField: INVALID_STRING,
    nestedNumberField: INVALID_NUMBER,
    nestedBooleanField: INVALID_BOOLEAN,
});

export const INVALID_NESTED_OBJECT_WITH_INVALID_STRING_FIELD = Object.freeze({
    nestedStringField: INVALID_STRING,
    nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_NESTED_OBJECT_WITH_INVALID_NUMBER_FIELD = Object.freeze({
    nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
    nestedNumberField: INVALID_NUMBER,
    nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_NESTED_OBJECT_WITH_INVALID_BOOLEAN_FIELD = Object.freeze({
    nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
    nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    nestedBooleanField: INVALID_BOOLEAN,
});

export const INVALID_TEST_OBJECT = Object.freeze({
    stringField: INVALID_STRING,
    numberField: INVALID_NUMBER,
    booleanField: INVALID_BOOLEAN,
    objectField: INVALID_NESTED_OBJECT,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_STRING_FIELD = Object.freeze({
    stringField: INVALID_STRING,
    numberField: VALID_NUMBER,
    booleanField: VALID_BOOLEAN,
    objectField: VALID_NESTED_OBJECT,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_NUMBER_FIELD = Object.freeze({
    stringField: VALID_STRING,
    numberField: INVALID_NUMBER,
    booleanField: VALID_BOOLEAN,
    objectField: VALID_NESTED_OBJECT,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_BOOLEAN_FIELD = Object.freeze({
    stringField: VALID_STRING,
    numberField: VALID_NUMBER,
    booleanField: INVALID_BOOLEAN,
    objectField: VALID_NESTED_OBJECT,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_NESTED_OBJECT = Object.freeze({
    stringField: VALID_STRING,
    numberField: VALID_NUMBER,
    booleanField: VALID_BOOLEAN,
    objectField: INVALID_NESTED_OBJECT,
});
