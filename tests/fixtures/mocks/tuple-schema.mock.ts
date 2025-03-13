import { instance, mock, reset, when } from "ts-mockito";
import { Schema } from "@/Schema";
import { DEFAULT_BOOLEAN, DEFAULT_NUMBER, DEFAULT_STRING } from "../default-data";

export const tupleSchemaMock = mock<Schema<"tuple">>();

export const stringSchemaMock = mock<Schema<"primitive">>();

export const numberSchemaMock = mock<Schema<"primitive">>();

export const booleanSchemaMock = mock<Schema<"primitive">>();

export function initializeTupleSchemaMock() {
    when(tupleSchemaMock.type).thenReturn("tuple");
    when(tupleSchemaMock.defaultValue).thenReturn([]);

    when(stringSchemaMock.type).thenReturn("primitive");
    when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

    when(numberSchemaMock.type).thenReturn("primitive");
    when(numberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);

    when(booleanSchemaMock.type).thenReturn("primitive");
    when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);

    when(tupleSchemaMock.fields).thenReturn([
        instance(stringSchemaMock),
        instance(numberSchemaMock),
        instance(booleanSchemaMock),
    ]);
}

export function resetTupleSchemaMock() {
    reset<Schema>(tupleSchemaMock, stringSchemaMock, numberSchemaMock, booleanSchemaMock);
}
