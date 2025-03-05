expect.extend({
    toBeIterable(received, expected?: Array<unknown>) {
        const getIterator: Function = received[Symbol.iterator];
        if (!getIterator || typeof getIterator !== "function") {
            return failure(received, null, this.isNot);
        }
        const iterator: Iterator<unknown> = getIterator.call(received);
        if (typeof iterator.next !== "function") {
            return failure(received, null, this.isNot);
        }
        if (typeof iterator.next !== "function") {
            return failure(received, null, this.isNot);
        }

        if (expected) {
            const receivedValues = Array.from(received);
            if (expected.length !== receivedValues.length) {
                return failure(received, receivedValues, this.isNot, expected);
            }
            for (const value of expected) {
                if (!receivedValues.includes(value)) {
                    return failure(received, receivedValues, this.isNot, expected);
                }
            }
        }
        return success(received, this.isNot, expected);
    },
});

function failure(
    received: unknown,
    receivedValues: Array<unknown> | null,
    isNot: boolean,
    expected?: Array<unknown>
) {
    return {
        message: message.bind(null, received, isNot, expected),
        pass: false,
        actual: receivedValues,
        expected: expected,
    };
}

function success(received: unknown, isNot: boolean, expected?: Array<unknown>) {
    return {
        message: message.bind(null, received, isNot, expected),
        pass: true,
        actual: received,
        expected: expected,
    };
}

const message = (received: unknown, isNot: boolean, expected?: Array<unknown>) =>
    `expected ${received}${isNot ? " not" : ""} to be iterable${
        expected ? ` with ${expected.length > 0 ? `${expected.length} values` : "nothing"}` : ""
    }`;

export {};
