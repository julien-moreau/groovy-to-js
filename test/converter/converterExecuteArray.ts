import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../../src/converter/converter";
import { add, subtract, multiply } from "../../src/augmentations/operators";

const template = `
(function() {
    {{code}}
})();
`;

const execute = (str: string, expected: any[]) => {
    const result = convert(str);

    const context = vm.createContext();
    Object.assign(context, { add, subtract, multiply });

    const script = new vm.Script(result);
    const actual = script.runInContext(context) as any[];

    assert(actual.length === expected.length);
    actual.forEach((a, i) => assert(a === expected[i]));
};

describe("Executed converter", () => {
    it("should return array", () => {
        execute("[1,2, 3]", [1, 2, 3]);
    });

    it("should add array", () => {
        execute("[1, 2] + 3", [1, 2, 3]);
        execute("[1, 2] + [3, 4]", [1, 2, 3, 4]);
    });

    it("should subtract array", () => {
        execute("[1, 2] - 1", [2]);
        execute("[1, 2] - [1]", [2]);
    });

    it("should multiply arrays", () => {
        execute("[1, 2] * 2", [1, 2, 1, 2]);
    });
});
