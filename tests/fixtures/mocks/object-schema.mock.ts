import type { Schema } from "@/Schema";
import { instance, mock, reset, when } from "ts-mockito";
import {
    DEFAULT_TEST_OBJECT,
    DEFAULT_STRING,
    DEFAULT_NUMBER,
    DEFAULT_BOOLEAN,
    DEFAULT_NESTED_OBJECT,
} from "../default-data";

export const objectSchemaMock = mock<Schema<"object">>();

export const stringSchemaMock = mock<Schema<"primitive">>();

export const numberSchemaMock = mock<Schema<"primitive">>();

export const booleanSchemaMock = mock<Schema<"primitive">>();

export const nestedObjectSchemaMock = mock<Schema<"object">>();

export const nestedStringSchemaMock = mock<Schema<"primitive">>();

export const nestedNumberSchemaMock = mock<Schema<"primitive">>();

export const nestedBooleanSchemaMock = mock<Schema<"primitive">>();

export function initializeObjectSchemaMock() {
    when(objectSchemaMock.type).thenReturn("object");
    when(objectSchemaMock.defaultValue).thenReturn(DEFAULT_TEST_OBJECT);

    when(stringSchemaMock.type).thenReturn("primitive");
    when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

    when(numberSchemaMock.type).thenReturn("primitive");
    when(numberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);

    when(booleanSchemaMock.type).thenReturn("primitive");
    when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);

    when(nestedObjectSchemaMock.type).thenReturn("object");
    when(nestedObjectSchemaMock.defaultValue).thenReturn(DEFAULT_NESTED_OBJECT);

    when(nestedStringSchemaMock.type).thenReturn("primitive");
    when(nestedStringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

    when(nestedNumberSchemaMock.type).thenReturn("primitive");
    when(nestedNumberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);

    when(nestedBooleanSchemaMock.type).thenReturn("primitive");
    when(nestedBooleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);

    when(nestedObjectSchemaMock.fields).thenReturn({
        nestedStringField: instance(nestedStringSchemaMock),
        nestedNumberField: instance(nestedNumberSchemaMock),
        nestedBooleanField: instance(nestedBooleanSchemaMock),
    });

    when(objectSchemaMock.fields).thenReturn({
        stringField: instance(stringSchemaMock),
        numberField: instance(numberSchemaMock),
        booleanField: instance(booleanSchemaMock),
        objectField: instance(nestedObjectSchemaMock),
    });
}

export function resetObjectSchemaMock() {
    reset<Schema>(
        objectSchemaMock,
        stringSchemaMock,
        numberSchemaMock,
        booleanSchemaMock,
        nestedObjectSchemaMock,
        nestedStringSchemaMock,
        nestedNumberSchemaMock,
        nestedBooleanSchemaMock
    );
}
