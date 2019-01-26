import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../src/converter/converter";
import { add, subtract, multiply, bitwiseLeft } from "../src/augmentations/operators";

const template = `
(function() {
{{code}}
})();
`;

const execute = (str: string, expected: any) => {
    const result = template.replace("{{code}}", convert(str));

    const context = vm.createContext();
    Object.assign(context, { add, subtract, multiply, bitwiseLeft });

    const script = new vm.Script(result);
    const actual = script.runInContext(context) as any[];

    assert(actual === expected);
};

describe("Ultimate", () => {
    it("should parse the given code", () => {
        execute(`
            def a = 0;
            def b = [];
            def c = "1";
            def d = 0;
            def emptyMap = [:];
            def map = [
                a: 0,
                b: 1,
                c: d == 0 ? 2 : 1
            ];

            String str = "helloworld";

            for (def i = 0; i < 1024; i++) {
                b << i;
                a++;
                c += (d++) + (++d);
                c *= d;
                d /= d;
                map.a += 1;

                if (i == 512) {
                    break;
                }
            }

            return a;
        `, 513);
    });
});