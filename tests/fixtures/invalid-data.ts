import { VALID_NESTED_OBJECT } from "./valid-data";

export const INVALID_STRING: string = 0 as any;
export const INVALID_NUMBER: number = "invalid" as any;
export const INVALID_BOOLEAN: boolean = 0 as any;

export const INVALID_NESTED_OBJECT: Readonly<NestedObject> = Object.freeze({
    nestedRequiredField: INVALID_STRING,
    nestedOptionalField: INVALID_STRING,
    nestedStringField: INVALID_STRING,
    nestedNumberField: INVALID_NUMBER,
    nestedBooleanField: INVALID_BOOLEAN,
});

export const INVALID_NESTED_OBJECT_WITH_INVALID_REQUIRED_FIELD: Readonly<NestedObject> =
    Object.freeze({
        nestedRequiredField: null as any,
        nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
        nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
        nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    });

export const INVALID_NESTED_OBJECT_WITH_INVALID_OPTIONAL_FIELD: Readonly<NestedObject> =
    Object.freeze({
        nestedRequiredField: VALID_NESTED_OBJECT.nestedRequiredField,
        nestedOptionalField: INVALID_STRING,
        nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
        nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
        nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    });

export const INVALID_NESTED_OBJECT_WITH_INVALID_STRING_FIELD: Readonly<NestedObject> =
    Object.freeze({
        nestedRequiredField: VALID_NESTED_OBJECT.nestedRequiredField,
        nestedStringField: INVALID_STRING,
        nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
        nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    });

export const INVALID_NESTED_OBJECT_WITH_INVALID_NUMBER_FIELD: Readonly<NestedObject> =
    Object.freeze({
        nestedRequiredField: VALID_NESTED_OBJECT.nestedRequiredField,
        nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
        nestedNumberField: INVALID_NUMBER,
        nestedBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    });

export const INVALID_NESTED_OBJECT_WITH_INVALID_BOOLEAN_FIELD: Readonly<NestedObject> =
    Object.freeze({
        nestedRequiredField: VALID_NESTED_OBJECT.nestedRequiredField,
        nestedStringField: VALID_NESTED_OBJECT.nestedStringField,
        nestedNumberField: VALID_NESTED_OBJECT.nestedNumberField,
        nestedBooleanField: INVALID_BOOLEAN,
    });

export const INVALID_TEST_OBJECT: Readonly<TestSchema> = Object.freeze({
    requiredField: INVALID_STRING,
    optionalField: INVALID_STRING,
    stringField: INVALID_STRING,
    numberField: INVALID_NUMBER,
    booleanField: INVALID_BOOLEAN,
    objectField: INVALID_NESTED_OBJECT,
    lazyObjectField: INVALID_NESTED_OBJECT,
    lazyStringField: INVALID_STRING,
    lazyNumberField: INVALID_NUMBER,
    lazyBooleanField: INVALID_BOOLEAN,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_REQUIRED_FIELD: Readonly<TestSchema> = Object.freeze({
    requiredField: null as any,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_OPTIONAL_FIELD: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    optionalField: null as any,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_STRING_FIELD: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: INVALID_STRING,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_NUMBER_FIELD: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: INVALID_NUMBER,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_BOOLEAN_FIELD: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: INVALID_BOOLEAN,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_NESTED_OBJECT: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: INVALID_NESTED_OBJECT,
    lazyObjectField: INVALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_LAZY_OBJECT: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: INVALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_LAZY_STRING: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: INVALID_STRING,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_INVALID_LAZY_NUMBER: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: INVALID_NUMBER,
    lazyBooleanField: VALID_NESTED_OBJECT.nestedBooleanField,
});

export const INVALID_TEST_OBJECT_WITH_LAZY_BOOLEAN: Readonly<TestSchema> = Object.freeze({
    requiredField: VALID_NESTED_OBJECT.nestedRequiredField,
    stringField: VALID_NESTED_OBJECT.nestedStringField,
    numberField: VALID_NESTED_OBJECT.nestedNumberField,
    booleanField: VALID_NESTED_OBJECT.nestedBooleanField,
    objectField: VALID_NESTED_OBJECT,
    lazyObjectField: VALID_NESTED_OBJECT,
    lazyStringField: VALID_NESTED_OBJECT.nestedStringField,
    lazyNumberField: VALID_NESTED_OBJECT.nestedNumberField,
    lazyBooleanField: INVALID_BOOLEAN,
});
