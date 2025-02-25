expect.extend({
    toBeIterable(received, args: [Array<unknown>]) {
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

        const expected = args[0];
        if (expected) {
            const receivedValues = Array.from(received);
            if (expected.length !== receivedValues.length) {
                return failure(received, this.isNot);
            }
            for (const value of expected) {
                if (!receivedValues.includes(value)) {
                    return failure(received, this.isNot);
                }
            }
        }
        return success(received, this.isNot);
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
    `expected ${received}${isNot ? " not" : ""} to be iterable`;

export {};
