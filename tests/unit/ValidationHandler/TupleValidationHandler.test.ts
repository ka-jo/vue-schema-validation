import { anything, instance, when } from "ts-mockito";
import { TupleValidationHandler } from "@/ValidationHandler";
import { TupleSchemaValidation } from "@/Types/TupleSchemaValidation";
import { SchemaValidationError } from "@/Schema";
import {
    initializeTupleSchemaMock,
    resetTupleSchemaMock,
    tupleSchemaMock,
    stringSchemaMock,
    numberSchemaMock,
    booleanSchemaMock,
} from "tests/fixtures/mocks/tuple-schema.mock";
import { VALID_BOOLEAN, VALID_NUMBER, VALID_STRING, VALID_TUPLE } from "tests/fixtures/valid-data";
import {
    DEFAULT_BOOLEAN,
    DEFAULT_NUMBER,
    DEFAULT_STRING,
    DEFAULT_TUPLE,
} from "tests/fixtures/default-data";
import {
    initializeObjectSchemaMock,
    objectSchemaMock,
    resetObjectSchemaMock,
} from "tests/fixtures/mocks/object-schema.mock";
import {
    arraySchemaMock,
    initializeArraySchemaMock,
    resetArraySchemaMock,
} from "tests/fixtures/mocks/array-schema.mock";
import {
    INVALID_BOOLEAN,
    INVALID_NUMBER,
    INVALID_STRING,
    INVALID_TUPLE,
} from "tests/fixtures/invalid-data";
import { anyArrayWithValues } from "tests/util/any-array-with-values";

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

        it("should be updated when field values are updated", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
            });

            handler.fields[0].value = VALID_STRING;

            // Because the value is an array proxy, normal expect checks for arrays don't seem to work
            expect(handler.value.value).toBeInstanceOf(Array);
            expect(handler.value.value).toMatchObject({
                0: VALID_STRING,
                1: DEFAULT_NUMBER,
                2: DEFAULT_BOOLEAN,
            });
        });

        describe("when initialized", () => {
            it("should initialize with provided value", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: [VALID_STRING, VALID_NUMBER, VALID_BOOLEAN],
                });

                expect(handler.value.value).toBeInstanceOf(Array);
                expect(handler.value.value).toMatchObject({
                    0: VALID_STRING,
                    1: VALID_NUMBER,
                    2: VALID_BOOLEAN,
                });
            });

            it("should initialize with schema default value if no value provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn([
                    DEFAULT_STRING,
                    DEFAULT_NUMBER,
                    DEFAULT_BOOLEAN,
                ]);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value.value).toBeInstanceOf(Array);
                expect(handler.value.value).toMatchObject({
                    0: DEFAULT_STRING,
                    1: DEFAULT_NUMBER,
                    2: DEFAULT_BOOLEAN,
                });
            });

            it("should initialize with field default values if no value or schema default value provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn(undefined);
                when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                when(numberSchemaMock.defaultValue).thenReturn(DEFAULT_NUMBER);
                when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value.value).toBeInstanceOf(Array);
                expect(handler.value.value).toMatchObject({
                    0: DEFAULT_STRING,
                    1: DEFAULT_NUMBER,
                    2: DEFAULT_BOOLEAN,
                });
            });

            it("should initialize with null values if no value, schema default value, or field default values provided", () => {
                when(tupleSchemaMock.defaultValue).thenReturn(undefined);
                when(stringSchemaMock.defaultValue).thenReturn(undefined);
                when(numberSchemaMock.defaultValue).thenReturn(undefined);
                when(booleanSchemaMock.defaultValue).thenReturn(undefined);
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                expect(handler.value.value).toBeInstanceOf(Array);
                expect(handler.value.value).toMatchObject({
                    0: null,
                    1: null,
                    2: null,
                });
            });
        });

        describe("when assigned", () => {
            describe("given a partial value", () => {
                it("should merge provided value with schema default", () => {
                    when(tupleSchemaMock.defaultValue).thenReturn([
                        DEFAULT_STRING,
                        DEFAULT_NUMBER,
                        DEFAULT_BOOLEAN,
                    ]);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    handler.value.value = [VALID_STRING, undefined, VALID_BOOLEAN];

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: VALID_STRING,
                        1: DEFAULT_NUMBER,
                        2: VALID_BOOLEAN,
                    });
                });

                it("should merge provided value with schema default and field defaults", () => {
                    when(tupleSchemaMock.defaultValue).thenReturn([DEFAULT_STRING]);
                    when(booleanSchemaMock.defaultValue).thenReturn(DEFAULT_BOOLEAN);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    handler.value.value = [undefined, VALID_NUMBER, undefined];

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_STRING,
                        1: VALID_NUMBER,
                        2: DEFAULT_BOOLEAN,
                    });
                });

                it("should result in null values if no value, schema default value, or field default values provided", () => {
                    when(tupleSchemaMock.defaultValue).thenReturn(undefined);
                    when(stringSchemaMock.defaultValue).thenReturn(undefined);
                    when(numberSchemaMock.defaultValue).thenReturn(undefined);
                    when(booleanSchemaMock.defaultValue).thenReturn(undefined);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    handler.value.value = [undefined, undefined, undefined];

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: null,
                        1: null,
                        2: null,
                    });
                });
            });

            describe("given a complete value", () => {
                it("should replace all values", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value = [VALID_STRING, VALID_NUMBER, VALID_BOOLEAN];

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: VALID_STRING,
                        1: VALID_NUMBER,
                        2: VALID_BOOLEAN,
                    });
                });
            });

            it("should set isDirty for child fields that change", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                });

                handler.value.value = [VALID_STRING, VALID_NUMBER, !DEFAULT_BOOLEAN];

                expect(handler.fields[0].isDirty).toBe(true);
                expect(handler.fields[1].isDirty).toBe(true);
                expect(handler.fields[2].isDirty).toBe(true);
            });

            it("should not set isDirty for child fields that do not change", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                });

                handler.value.value = [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN];

                expect(handler.fields[0].isDirty).toBe(false);
                expect(handler.fields[1].isDirty).toBe(false);
                expect(handler.fields[2].isDirty).toBe(false);
            });
        });

        describe("when mutated", () => {
            describe("via index", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value[0] = VALID_STRING;

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: VALID_STRING,
                        1: DEFAULT_NUMBER,
                        2: DEFAULT_BOOLEAN,
                    });
                });

                it("should set isDirty for child field that changes", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value[0] = VALID_STRING;

                    expect(handler.fields[0].isDirty).toBe(true);
                });

                it("should not set isDirty for child field that does not change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value[0] = DEFAULT_STRING;

                    expect(handler.fields[0].isDirty).toBe(false);
                });

                it("should not create new field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.fields).toHaveLength(3);

                    handler.value.value[4] = VALID_STRING;

                    expect(handler.fields).toHaveLength(3);
                });
            });

            describe("via push", () => {
                it("should not update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, null],
                    });

                    handler.value.value.push(VALID_BOOLEAN);

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_STRING,
                        1: DEFAULT_NUMBER,
                        2: null,
                    });
                });

                it("should not create new field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, null],
                    });

                    expect(handler.fields).toHaveLength(3);

                    handler.value.value.push(VALID_BOOLEAN);

                    expect(handler.fields).toHaveLength(3);
                });
            });

            describe("via pop", () => {
                it("should update value with field default for popped field", () => {
                    when(booleanSchemaMock.defaultValue).thenReturn(!DEFAULT_BOOLEAN);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.pop();

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_STRING,
                        1: DEFAULT_NUMBER,
                        2: !DEFAULT_BOOLEAN,
                    });
                    expect(handler.fields[2].value).toBe(!DEFAULT_BOOLEAN);
                });

                it("should not change value length", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.value.value).toHaveLength(3);

                    handler.value.value.pop();

                    expect(handler.value.value).toHaveLength(3);
                });

                it("should not remove field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.fields).toHaveLength(3);

                    handler.value.value.pop();

                    expect(handler.fields).toHaveLength(3);
                });
            });

            describe("via shift", () => {
                it("should update value with default field value for last field", () => {
                    when(booleanSchemaMock.defaultValue).thenReturn(null);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.shift();

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_NUMBER,
                        1: DEFAULT_BOOLEAN,
                        2: null,
                    });
                    expect(handler.fields[2].value).toBeNull();
                });

                it("should not change value length", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.value.value).toHaveLength(3);

                    handler.value.value.shift();

                    expect(handler.value.value).toHaveLength(3);
                });

                it("should not remove field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.fields).toHaveLength(3);

                    handler.value.value.shift();

                    expect(handler.fields).toHaveLength(3);
                });
            });

            describe("via unshift", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [null, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.unshift(VALID_STRING);

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: VALID_STRING,
                        1: null,
                        2: DEFAULT_NUMBER,
                    });
                });

                it("should not change value length", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [null, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.value.value).toHaveLength(3);

                    handler.value.value.unshift(VALID_STRING);

                    expect(handler.value.value).toHaveLength(3);
                });

                it("should set isDirty for child fields that change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [null, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.unshift(VALID_STRING);

                    expect(handler.fields[0].isDirty).toBe(true);
                    expect(handler.fields[1].isDirty).toBe(true);
                    expect(handler.fields[2].isDirty).toBe(true);
                });

                it("should not create new field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [null, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    expect(handler.fields).toHaveLength(3);

                    handler.value.value.unshift(VALID_STRING);

                    expect(handler.fields).toHaveLength(3);
                });
            });

            describe("via splice", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.splice(1, 1, VALID_NUMBER);

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_STRING,
                        1: VALID_NUMBER,
                        2: DEFAULT_BOOLEAN,
                    });
                });

                it("should set isDirty for child field that changes", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.splice(1, 1, VALID_NUMBER);

                    expect(handler.fields[1].isDirty).toBe(true);
                });

                it("should not set isDirty for child field that does not change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.splice(1, 1, DEFAULT_NUMBER);

                    expect(handler.fields[1].isDirty).toBe(false);
                });
            });

            describe("via fill", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });
                    handler.value.value.fill(VALID_STRING);

                    setTimeout(() => {
                        expect(handler.value.value).toBeInstanceOf(Array);
                        expect(handler.value.value).toMatchObject({
                            0: VALID_STRING,
                            1: VALID_STRING,
                            2: VALID_STRING,
                        });
                    }, 100);
                });

                it("should set isDirty for all child fields that change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.fill(VALID_STRING);

                    expect(handler.fields[0].isDirty).toBe(true);
                    expect(handler.fields[1].isDirty).toBe(true);
                    expect(handler.fields[2].isDirty).toBe(true);
                });
            });

            describe("via copyWithin", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.copyWithin(0, 1);

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_NUMBER,
                        1: DEFAULT_BOOLEAN,
                        2: DEFAULT_BOOLEAN,
                    });
                });

                it("should set isDirty for all child fields that change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.copyWithin(0, 1);

                    expect(handler.fields[0].isDirty).toBe(true);
                    expect(handler.fields[1].isDirty).toBe(true);
                    expect(handler.fields[2].isDirty).toBe(false);
                });
            });

            describe("via reverse", () => {
                it("should update value", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.reverse();

                    expect(handler.value.value).toBeInstanceOf(Array);
                    expect(handler.value.value).toMatchObject({
                        0: DEFAULT_BOOLEAN,
                        1: DEFAULT_NUMBER,
                        2: DEFAULT_STRING,
                    });
                });

                it("should set isDirty for all child fields that change", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: [DEFAULT_STRING, DEFAULT_NUMBER, DEFAULT_BOOLEAN],
                    });

                    handler.value.value.reverse();

                    expect(handler.fields[0].isDirty).toBe(true);
                    expect(handler.fields[1].isDirty).toBe(false);
                    expect(handler.fields[2].isDirty).toBe(true);
                });
            });
        });
    });

    describe("errors property", () => {
        it("should be a Vue ref", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
            expect(handler.errors).toBeVueRef();
        });

        it("should contain array $root property", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
            expect(handler.errors.value).toHaveProperty("$root", expect.any(Array));
        });

        it("should contain iterable property for each schema field", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
            expect(handler.errors.value).toHaveProperty("0", expect.toBeIterable());
            expect(handler.errors.value).toHaveProperty("1", expect.toBeIterable());
            expect(handler.errors.value).toHaveProperty("2", expect.toBeIterable());
        });

        it("should be iterable for all field errors", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["string error"])
            );
            when(numberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["number error"])
            );
            when(booleanSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["boolean error"])
            );
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.errors.value).toBeIterable([
                "string error",
                "number error",
                "boolean error",
            ]);
        });

        describe("when initialized", () => {
            it("should have empty array for $root property", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
                expect(handler.errors.value.$root).toEqual([]);
            });

            it("should have empty array properties for each schema field", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
                expect(handler.errors.value).toHaveProperty("0", []);
                expect(handler.errors.value).toHaveProperty("1", []);
                expect(handler.errors.value).toHaveProperty("2", []);
            });

            it("should be empty when iterated", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});
                expect(handler.errors.value).toBeIterable([]);
            });
        });
    });

    describe("fields property", () => {
        it("should have a property for every schema field", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.fields).toHaveProperty("0");
            expect(handler.fields).toHaveProperty("1");
            expect(handler.fields).toHaveProperty("2");
        });

        it("should have properties that are SchemaValidation objects of the correct type", () => {
            initializeObjectSchemaMock();
            initializeArraySchemaMock();
            when(tupleSchemaMock.fields).thenReturn([
                instance(stringSchemaMock),
                instance(objectSchemaMock),
                instance(arraySchemaMock),
            ]);
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.fields).toHaveProperty("0", expect.toBeSchemaValidation(String));
            expect(handler.fields).toHaveProperty("1", expect.toBeSchemaValidation(Object));
            expect(handler.fields).toHaveProperty("2", expect.toBeSchemaValidation(Array));

            resetObjectSchemaMock();
            resetArraySchemaMock();
        });
    });

    describe("isValid property", () => {
        it("should be a Vue ref", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.isValid).toBeVueRef();
        });

        it("should initialize to false", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if root is invalid", () => {
            when(tupleSchemaMock.validateRoot(anything(), anything())).thenThrow(
                new SchemaValidationError(["root error"])
            );
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.isValid.value).toBe(false);
        });

        it("should be false if any field is invalid", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["string error"])
            );
            when(numberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(booleanSchemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.isValid.value).toBe(false);
        });

        it("should be true if root is valid and all fields are valid", () => {
            when(tupleSchemaMock.validateRoot(anything(), anything())).thenReturn(true);
            when(stringSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(numberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(booleanSchemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.isValid.value).toBe(true);
        });
    });

    describe("isDirty property", () => {
        it("should be a Vue ref", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.isDirty).toBeVueRef();
        });

        it("should initialize to false", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.isDirty.value).toBe(false);
        });

        it("should be true if any field is dirty", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.fields[0].value = VALID_STRING;

            expect(handler.fields[0].isDirty).toBe(true);
            expect(handler.fields[1].isDirty).toBe(false);
            expect(handler.fields[2].isDirty).toBe(false);
            expect(handler.isDirty.value).toBe(true);
        });

        it("should be false if no fields are dirty", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(handler.fields[0].isDirty).toBe(false);
            expect(handler.fields[1].isDirty).toBe(false);
            expect(handler.fields[2].isDirty).toBe(false);
            expect(handler.isDirty.value).toBe(false);
        });
    });

    describe("validate method", () => {
        describe("given valid data", () => {
            beforeEach(() => {
                when(
                    tupleSchemaMock.validateRoot(anyArrayWithValues(VALID_TUPLE), anything())
                ).thenReturn(true);
                when(stringSchemaMock.validate(VALID_STRING, anything())).thenReturn(true);
                when(numberSchemaMock.validate(VALID_NUMBER, anything())).thenReturn(true);
                when(booleanSchemaMock.validate(VALID_BOOLEAN, anything())).thenReturn(true);
            });

            it("should return true", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                const result = handler.validate();

                expect(result).toBe(true);
            });

            it("should set isValid to true", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                handler.validate();

                expect(handler.isValid.value).toBe(true);
            });

            it("should reset errors", () => {
                when(
                    tupleSchemaMock.validateRoot(anyArrayWithValues(INVALID_TUPLE), anything())
                ).thenThrow(new SchemaValidationError(["root error"]));
                when(stringSchemaMock.validate(INVALID_STRING, anything())).thenThrow(
                    new SchemaValidationError(["string error"])
                );
                when(numberSchemaMock.validate(INVALID_NUMBER, anything())).thenThrow(
                    new SchemaValidationError(["number error"])
                );
                when(booleanSchemaMock.validate(INVALID_BOOLEAN, anything())).thenThrow(
                    new SchemaValidationError(["boolean error"])
                );
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: INVALID_TUPLE,
                });

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: ["root error"],
                    0: ["string error"],
                    1: ["number error"],
                    2: ["boolean error"],
                });

                handler.value.value = VALID_TUPLE;

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: [],
                    0: [],
                    1: [],
                    2: [],
                });
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                when(
                    tupleSchemaMock.validateRoot(anyArrayWithValues(INVALID_TUPLE), anything())
                ).thenThrow(new SchemaValidationError(["root error"]));
                when(stringSchemaMock.validate(INVALID_STRING, anything())).thenThrow(
                    new SchemaValidationError(["string error"])
                );
                when(numberSchemaMock.validate(INVALID_NUMBER, anything())).thenThrow(
                    new SchemaValidationError(["number error"])
                );
                when(booleanSchemaMock.validate(INVALID_BOOLEAN, anything())).thenThrow(
                    new SchemaValidationError(["boolean error"])
                );
            });

            it("should return false", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: INVALID_TUPLE,
                });

                const result = handler.validate();

                expect(result).toBe(false);
            });

            it("should set isValid to false", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: INVALID_TUPLE,
                });

                handler.validate();

                expect(handler.isValid.value).toBe(false);
            });

            it("should populate errors", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: INVALID_TUPLE,
                });

                handler.validate();

                expect(handler.errors.value).toMatchObject({
                    $root: ["root error"],
                    0: ["string error"],
                    1: ["number error"],
                    2: ["boolean error"],
                });
            });
        });

        it("should throw if an unexpected error occurs", () => {
            when(tupleSchemaMock.validateRoot(anything(), anything())).thenThrow(
                new Error("unexpected error")
            );
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            expect(() => handler.validate()).toThrow();
        });
    });

    describe("reset method", () => {
        describe("given a value", () => {
            it("should reset value to provided value", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: DEFAULT_TUPLE,
                });

                handler.reset(VALID_TUPLE);

                expect(handler.value.value).toBeIterable(VALID_TUPLE);
                expect(handler.fields[0].value).toBe(VALID_STRING);
                expect(handler.fields[1].value).toBe(VALID_NUMBER);
                expect(handler.fields[2].value).toBe(VALID_BOOLEAN);
            });

            it("should use value for future resets with no value provided", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: DEFAULT_TUPLE,
                });

                handler.reset(VALID_TUPLE);

                expect(handler.value.value).toBeIterable(VALID_TUPLE);
                expect(handler.fields[0].value).toBe(VALID_STRING);
                expect(handler.fields[1].value).toBe(VALID_NUMBER);
                expect(handler.fields[2].value).toBe(VALID_BOOLEAN);

                handler.value.value = DEFAULT_TUPLE;

                handler.reset();

                expect(handler.value.value).toBeIterable(VALID_TUPLE);
                expect(handler.fields[0].value).toBe(VALID_STRING);
                expect(handler.fields[1].value).toBe(VALID_NUMBER);
                expect(handler.fields[2].value).toBe(VALID_BOOLEAN);
            });

            describe("when value is partial", () => {
                it("should use field defaults for missing values", () => {
                    when(stringSchemaMock.defaultValue).thenReturn(DEFAULT_STRING);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: DEFAULT_TUPLE,
                    });

                    handler.reset([undefined, VALID_NUMBER, VALID_BOOLEAN]);

                    expect(handler.value.value).toBeIterable([
                        DEFAULT_STRING,
                        VALID_NUMBER,
                        VALID_BOOLEAN,
                    ]);
                    expect(handler.fields[0].value).toBe(DEFAULT_STRING);
                    expect(handler.fields[1].value).toBe(VALID_NUMBER);
                    expect(handler.fields[2].value).toBe(VALID_BOOLEAN);
                });

                it("should result in null values if no field default for missing values", () => {
                    when(stringSchemaMock.defaultValue).thenReturn(undefined);
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: DEFAULT_TUPLE,
                    });

                    handler.reset([undefined, VALID_NUMBER, VALID_BOOLEAN]);

                    expect(handler.value.value).toBeIterable([null, VALID_NUMBER, VALID_BOOLEAN]);
                    expect(handler.fields[0].value).toBeNull();
                    expect(handler.fields[1].value).toBe(VALID_NUMBER);
                    expect(handler.fields[2].value).toBe(VALID_BOOLEAN);
                });
            });
        });

        describe("given no value", () => {
            it("should reset value to initial value", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {
                    value: DEFAULT_TUPLE,
                });

                handler.value.value = VALID_TUPLE;

                handler.reset();

                expect(handler.value.value).toBeIterable(DEFAULT_TUPLE);
            });
        });

        it("should reset $root errors", () => {
            when(tupleSchemaMock.validateRoot(anything(), anything())).thenThrow(
                new SchemaValidationError(["root error"])
            );
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.errors.value.$root).toEqual(["root error"]);

            handler.reset();

            expect(handler.errors.value.$root).toEqual([]);
        });

        it("should reset all field errors", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["string error"])
            );
            when(numberSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["number error"])
            );
            when(booleanSchemaMock.validate(anything(), anything())).thenThrow(
                new SchemaValidationError(["boolean error"])
            );
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.errors.value).toHaveProperty("0", ["string error"]);
            expect(handler.errors.value).toHaveProperty("1", ["number error"]);
            expect(handler.errors.value).toHaveProperty("2", ["boolean error"]);

            handler.reset();

            expect(handler.errors.value).toHaveProperty("0", []);
            expect(handler.errors.value).toHaveProperty("1", []);
            expect(handler.errors.value).toHaveProperty("2", []);
        });

        it("should set all fields' isValid to false", () => {
            when(stringSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(numberSchemaMock.validate(anything(), anything())).thenReturn(true);
            when(booleanSchemaMock.validate(anything(), anything())).thenReturn(true);
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.validate();

            expect(handler.fields[0].isValid).toBe(true);
            expect(handler.fields[1].isValid).toBe(true);
            expect(handler.fields[2].isValid).toBe(true);

            handler.reset();

            expect(handler.fields[0].isValid).toBe(false);
            expect(handler.fields[1].isValid).toBe(false);
            expect(handler.fields[2].isValid).toBe(false);
        });

        it("should set all fields' isDirty to false", () => {
            const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

            handler.fields[0].value = VALID_STRING;
            handler.fields[1].value = VALID_NUMBER;
            handler.fields[2].value = !handler.fields[2].value;

            expect(handler.fields[0].isDirty).toBe(true);
            expect(handler.fields[1].isDirty).toBe(true);
            expect(handler.fields[2].isDirty).toBe(true);

            handler.reset();

            expect(handler.fields[0].isDirty).toBe(false);
            expect(handler.fields[1].isDirty).toBe(false);
            expect(handler.fields[2].isDirty).toBe(false);
        });
    });

    describe("toReactive method", () => {
        describe("return value", () => {
            it("should be a schema validation object", () => {
                const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                const reactive = handler.toReactive();

                expect(reactive).toBeSchemaValidation(Array);
            });

            describe("errors property", () => {
                it("should throw error when assigned", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.errors = null as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.errors).toHaveProperty("0", expect.toBeIterable());
                    expect(reactive.errors).toHaveProperty("1", expect.toBeIterable());
                    expect(reactive.errors).toHaveProperty("2", expect.toBeIterable());
                });

                it("should have readonly $root property", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.errors).toHaveProperty("$root", expect.toBeIterable());

                    //@ts-expect-error
                    reactive.errors.$root = null as any;
                });

                it("should have readonly properties", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive: TupleSchemaValidation<[string, number, boolean]> =
                        handler.toReactive() as any;

                    //@ts-expect-error
                    reactive.errors[0] = null as any;
                    //@ts-expect-error
                    reactive.errors[1] = null as any;
                    //@ts-expect-error
                    reactive.errors[2] = null as any;

                    expect(reactive.errors[0]).not.toBeNull();
                    expect(reactive.errors[1]).not.toBeNull();
                    expect(reactive.errors[2]).not.toBeNull();
                });
            });

            describe("fields property", () => {
                it("should throw error when assigned", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.fields = null as any;
                    }).toThrow();
                });

                it("should have a property for each schema field", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(reactive.fields).toHaveProperty("0", expect.toBeSchemaValidation());
                    expect(reactive.fields).toHaveProperty("1", expect.toBeSchemaValidation());
                    expect(reactive.fields).toHaveProperty("2", expect.toBeSchemaValidation());
                });

                it("should have readonly properties", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive: TupleSchemaValidation<[string, number, boolean]> =
                        handler.toReactive() as any;

                    //@ts-expect-error
                    reactive.fields[0] = null as any;
                    //@ts-expect-error
                    reactive.fields[1] = null as any;
                    //@ts-expect-error
                    reactive.fields[2] = null as any;

                    expect(reactive.fields[0]).not.toBeNull();
                    expect(reactive.fields[1]).not.toBeNull();
                    expect(reactive.fields[2]).not.toBeNull();
                });
            });

            describe("isValid property", () => {
                it("should throw an error when assigned", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.isValid = null as any;
                    }).toThrow();
                });
            });

            describe("isDirty property", () => {
                it("should throw an error when assigned", () => {
                    const handler = TupleValidationHandler.create(instance(tupleSchemaMock), {});

                    const reactive = handler.toReactive();

                    expect(() => {
                        //@ts-expect-error
                        reactive.isDirty = null as any;
                    }).toThrow();
                });
            });
        });
    });

    describe("static create method", () => {
        describe("given initial value", () => {
            it("should throw a TypeError if provided value is not an array", () => {
                expect(() =>
                    TupleValidationHandler.create(instance(tupleSchemaMock), {
                        value: null as any,
                    })
                ).toThrow(TypeError);
            });
        });
    });
});
