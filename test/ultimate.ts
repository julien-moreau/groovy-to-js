import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../src/converter/converter";
import { add, subtract, multiply } from "../src/augmentations/operators";

const template = `
(function() {
{{code}}
})();
`;

const execute = (str: string, expected: any) => {
    const result = template.replace("{{code}}", convert(str));

    const context = vm.createContext();
    Object.assign(context, { add, subtract, multiply });

    const script = new vm.Script(result);
    const actual = script.runInContext(context) as any[];

    return actual === expected;
};

describe("Ultimate", () => {
    it.skip("should parse the given code", () => {
        execute(`
            def a = 0;
            def b = [];

            for (def i = 0; i < 1024; i++) {
                b << i;
                a++;

                if (i == 512) {
                    break;
                }
            }

            return a;
        `, 0);
    });
});