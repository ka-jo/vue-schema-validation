declare type TestSchema = {
    stringField: string;
    numberField: number;
    booleanField: boolean;
    objectField: NestedObject;
};

declare type NestedObject = {
    nestedStringField: string;
    nestedNumberField: number;
    nestedBooleanField: boolean;
};
