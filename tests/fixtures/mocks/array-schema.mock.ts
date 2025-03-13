import { instance, mock, reset, when } from "ts-mockito";
import { Schema } from "@/Schema";
import { DEFAULT_STRING } from "../default-data";

export const arraySchemaMock = mock<Schema<"array">>();

export const stringSchemaMock = mock<Schema<"primitive">>();

export function initializeArraySchemaMock() {
    when(arraySchemaMock.type).thenReturn("array");
    when(arraySchemaMock.defaultValue).thenReturn([]);

    when(stringSchemaMock.type).thenReturn("primitive");
    when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);

    when(arraySchemaMock.fields).thenReturn(instance(stringSchemaMock));
}

export function resetArraySchemaMock() {
    reset<Schema>(arraySchemaMock, stringSchemaMock);
}
