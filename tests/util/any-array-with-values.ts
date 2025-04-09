import { Matcher } from "ts-mockito/lib/matcher/type/Matcher";

/**
 * This will create a matcher that will match for any array with the same values as the
 * provided array in the same order.
 * @remarks
 * Intended to be used by ts-mockito for stubbing schema mocks. The value that the schema
 * receives to validate is a proxy of the original value, so without this, it would be
 * impossible to mock a function yields different results when receiving different values
 * when the values are proxies.
 * @param values - any array of values to compare
 * @returns
 */
export function anyArrayWithValues(values: unknown[]): any {
    return new AnyArrayWithValuesMatcher(values);
}

class AnyArrayWithValuesMatcher extends Matcher {
    constructor(private values: unknown[]) {
        super();
    }

    match(value: unknown): boolean {
        if (Array.isArray(value) && value.length === this.values.length) {
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i] !== value[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    toString(): string {
        return `anyArrayWithValues(${JSON.stringify(this.values)})`;
    }
}
