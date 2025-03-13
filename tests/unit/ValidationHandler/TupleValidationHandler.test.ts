import { instance, mock, when } from "ts-mockito";
import { Schema } from "@/Schema";
import { TupleValidationHandler } from "@/ValidationHandler";
import {
    initializeTupleSchemaMock,
    resetTupleSchemaMock,
    tupleSchemaMock,
    stringSchemaMock,
    numberSchemaMock,
    booleanSchemaMock,
} from "tests/fixtures/mocks/tuple-schema.mock";
import { VALID_BOOLEAN, VALID_NUMBER, VALID_STRING } from "tests/fixtures/valid-data";
import { DEFAULT_BOOLEAN, DEFAULT_NUMBER, DEFAULT_STRING } from "tests/fixtures/default-data";

describe("TupleValidationHandler", () => {
    beforeEach(() => {
        initializeTupleSchemaMock();
    });

    afterEach(() => {
        resetTupleSchemaMock();
    });

    describe("value property", () => {
        it("should be a Vue ref", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
            expect(handler.value).toBeVueRef();
        });

        // type only test
        it("should be readonly", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
            // @ts-expect-error
            handler.value = null as any;
        });

        describe("when initialized", () => {
            it("should initialize with provided value", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: [VALID_STRING, VALID_NUMBER, VALID_BOOLEAN],
                });

                expect(handler.value).toEqual([VALID_STRING, VALID_NUMBER, VALID_BOOLEAN]);
            });

            it("should initialize with schema default value if no value provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn([
                    DEFAULT_STRING,
                    DEFAULT_NUMBER,
                    DEFAULT_BOOLEAN,
                ]);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value).toEqual([DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN]);
            });

            it("should initialize with field default values if no value or schema default value provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn(undefined);
                when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                when(numberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);
                when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value).toEqual([DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN]);
            });

            it("should initialize with null values if no value, schema default value, or field default values provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn(undefined);
                when(stringSchemaMock.defaultValue).thenReturn(undefined);
                when(numberSchemaMock.defaultValue).thenReturn(undefined);
                when(booleanSchemaMock.defaultValue).thenReturn(undefined);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value).toEqual([null, null, null]);
            });
        });

        describe("assignment", () => {
            describe("given a partial value", () => {});

            describe("given a complete value", () => {});
        });
    });
});
