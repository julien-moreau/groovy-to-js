import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../../src/converter/converter";
import { add, subtract, multiply } from "../../src/augmentations/operators";

const execute = (str: string, expected: any) => {
    const result = convert(str);

    const context = vm.createContext();
    Object.assign(context, { add, subtract, multiply });

    const script = new vm.Script(result);
    const actual = script.runInContext(context) as any[];

    return actual === expected;
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

        // Logic
        assert(execute("1 || 2", 1));
        assert(execute("1 && 2", 2)); // Javascript trick, return the second member and not only "true" or "false"
    });
});
