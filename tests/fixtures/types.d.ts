declare type TestSchema = {
    stringField: string;
    numberField: number;
    booleanField: boolean;
    objectField: NestedObject;
};

declare type NestedObject = {
    nestedRequiredField: string;
    nestedOptionalField?: string | null;
    nestedStringField: string;
    nestedNumberField: number;
    nestedBooleanField: boolean;
};
