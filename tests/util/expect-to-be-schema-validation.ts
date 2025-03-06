import { HandlerInstance } from "@/common";
import { ValidationHandler } from "@/ValidationHandler";

expect.extend({
    toBeSchemaValidation(received, expectedValueType?: unknown) {
        try {
            expect(received).toEqual({
                validate: expect.any(Function),
                reset: expect.any(Function),
                value: expectedValueType ? expect.any(expectedValueType) : expect.anything(),
                errors: expect.toBeIterable(),
                fields: expectedValueType === Object ? expect.any(Object) : undefined,
                isValid: expect.any(Boolean),
                isDirty: expect.any(Boolean),
                [HandlerInstance]: expect.any(ValidationHandler),
            });

            expect(received).toBeReactive();

            expect(() => {
                received.errors = {};
            }).toThrow();

            expect(() => {
                received.fields = {};
            });

            expect(() => {
                received.isValid = {};
            }).toThrow();

            expect(() => {
                received.isDirty = {};
            }).toThrow();
        } catch (error: any) {
            return {
                message: () => error.message,
                pass: false,
            };
        }
        return {
            message: () => "Expected value to be schema validation",
            pass: true,
        };
    },
});

function failure(received: unknown, isNot: boolean) {
    return {
        message: message.bind(null, received, isNot),
        pass: false,
    };
}

function success(received: unknown, isNot: boolean) {
    return {
        message: message.bind(null, received, isNot),
        pass: true,
    };
}

const message = (received: unknown, isNot: boolean) =>
    `expected ${received}${isNot ? " not" : ""} to be reactive Vue proxy`;
