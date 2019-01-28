import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../../src/converter/converter";
import { add, subtract, multiply, bitwiseLeft, spaceship } from "../../src/augmentations/operators";

const template = `
(function() {
{{code}}
})();
`;

const execute = (str: string, ctx: any, expected: any) => {
    const result = template.replace("{{code}}", convert(str, ctx));

    const context = vm.createContext();
    Object.assign(context, ctx, { add, subtract, multiply, bitwiseLeft, spaceship });

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
            def e = (float)((int)a);
            def f = (String)a;
            def g = (a <=> d) + ((a - 1) <=> d) + ((a + 4) <=> d);
            def emptyMap = [:];
            def map = [
                a: 0,
                b: 1,
                c: d == 0 ? 2 : 1
            ];

            String str = "helloworld";

            contextArray.each({ a++; a--; });
            b.each({  a++; a--; });
            b.each() { a++; a--; }
            b.eachWithIndex { value, index -> }

            def fn1(arg) { a += arg; a -= arg; }
            def fn2 = { arg -> a += arg;  a -= arg; }
            def fn3 = { String a, int b -> a += b; a -= b; }
            def fn4 = { -> a += 1; a -= 1; }

            for (def i = 0; i < 1024; i++) {
                b << i;
                a++;
                c += (d++) + (++d);
                c << a;
                c *= d;
                d /= d;
                d -= 0;
                map.a += 1;
                fn1(i);
                fn2(i);
                fn3("hello", i + i);
                fn4();

                if (i == 512) {
                    break;
                }
            }

            return a;
        `, {
            contextArray: [1, 2, 3]
        }, 513);
    });
});