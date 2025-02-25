import { isRef } from "vue";

expect.extend({
    toBeVueRef(received) {
        if (isRef(received)) {
            return success(received, this.isNot);
        } else {
            return failure(received, this.isNot);
        }
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
