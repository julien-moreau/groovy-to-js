import * as assert from "assert";
import { convert } from "../../src/converter/converter";

const template = `
(function() {
    {{code}}
})();
`;

const execute = (str: string, expected: any) => {
    const result = template.replace("{{code}}", convert(str));
    const actual = eval(result);
    return actual === expected;
};

describe("Executed converter", () => {
    it("should use 'return' keyword", () => {
        // Simple
        assert(execute(`
            def a = 0;
            return a + 2;
        `, 2));

        // Complex
        assert(execute(`
            def a = 6 + - 4 - -(-5);
            def b = 6 + - 4 - -(-5);
            return a - b * (a - b);
        `, -3));
    });

    it("should use the 'if' and 'else' keywords", () => {
        // Simple
        assert(execute(`
            if (1) {
                return 1;
            }
            return 0;
        `, 1));

        // if else
        assert(execute(`
            if (0) {
                return 0;
            } else {
                return 1;
            }
        `, 1));

        // If else if else
        assert(execute(`
            if (0) {
                return 0;
            } else if (0) {
                return 1;
            } else {
                return 2;
            }
        `, 2));
    });

    it("should use the 'if' and 'else' keywords without braces", () => {
        // Simple
        assert(execute(`
            if (1)
                return 1;
            
            return 0;
        `, 1));

        // if else
        assert(execute(`
            if (0)
                return 0;
            else
                return 1;
        `, 1));

        // // If else if else
        assert(execute(`
            if (0)
                return 0;
            else if (0)
                return 0;
            else
                return 1;
        `, 1));
    });
});
