expect.extend({
    toBeIterable(received, expected?: Array<unknown>) {
        const getIterator: Function = received[Symbol.iterator];
        if (!getIterator || typeof getIterator !== "function") {
            return failure(received, this.isNot);
        }
        const iterator: Iterator<unknown> = getIterator.call(received);
        if (typeof iterator.next !== "function") {
            return failure(received, this.isNot);
        }
        if (typeof iterator.next !== "function") {
            return failure(received, this.isNot);
        }

        if (expected) {
            const receivedValues = Array.from(received);
            if (expected.length !== receivedValues.length) {
                return failure(received, this.isNot, expected);
            }
            for (const value of expected) {
                if (!receivedValues.includes(value)) {
                    return failure(received, this.isNot, expected);
                }
            }
        }
        return success(received, this.isNot, expected);
    },
});

function failure(received: unknown, isNot: boolean, expected?: Array<unknown>) {
    return {
        message: message.bind(null, received, isNot, expected),
        pass: false,
    };
}

function success(received: unknown, isNot: boolean, expected?: Array<unknown>) {
    return {
        message: message.bind(null, received, isNot, expected),
        pass: true,
    };
}

const message = (received: unknown, isNot: boolean, expected?: Array<unknown>) =>
    `expected ${received}${isNot ? " not" : ""} to be iterable${
        expected ? ` including ${expected.length > 0 ? "nothing" : expected}` : ""
    }`;

export {};
