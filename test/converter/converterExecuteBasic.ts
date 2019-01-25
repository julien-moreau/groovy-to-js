import * as assert from "assert";
import { convert } from "../../src/converter/converter";

const execute = (str: string, expected: any) => {
    return eval(convert(str)) === expected;
};

describe("Executed converter", () => {
    it("should return results", () => {
        // Simple
        assert(execute("6 - 4 + 5", 7));
        assert(execute("6 - (4 + 5)", -3));
        assert(execute("(6 - 4) + 5", 7));

        // Unary minus
        assert(execute("6 + -4", 2.0));
        assert(execute("6 * -(4+6)", -60.0));
        assert(execute("6 + - 4 - -(-5)", -3.0));
    });
});
