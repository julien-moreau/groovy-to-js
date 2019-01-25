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

    it("should use the while loop", () => {
        assert(execute(`
            def a = 3;
            while (a > 0) {
                a--;
            }

            return a;
        `, 0));
    });

    it("should use the for loop", () => {
        assert(execute(`
            def a = 0;
            for (def i = 0; i < 3; i++) {
                a++;
            }

            return a;
        `, 3));
    });

    it("should use a for loop with empty initialization", () => {
        assert(execute(`
            def a = 0;
            for (; a < 3; a++) { }

            return a;
        `, 3));
    });

    it("should use a for loop with empty step", () => {
        assert(execute(`
            def a = 0;
            for (; ; a++) {
                break;
            }

            return a;
        `, 0));
    });

    it("should use a for ever for loop", () => {
        assert(execute(`
            def a = 0;
            for (;;) {
                break;
            }

            return a;
        `, 0));
    });

    it("should use a do loop", () => {
        assert(execute(`
            def a = 0;
            do {
                a++;
            } while (a < 3)

            return a;
        `, 3));
    });
});
