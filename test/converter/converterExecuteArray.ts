import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../../src/converter/converter";
import { add, subtract, multiply, bitwiseLeft } from "../../src/augmentations/operators";

const execute = (str: string, expected: any[]) => {
    const result = convert(str);

    const context = vm.createContext();
    Object.assign(context, { add, subtract, multiply, bitwiseLeft });

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

    it("should subtract or add with variables", () => {
        execute(`
            def a = [1, 2, 3];
            def b = [2, 3];

            (a + b) - b - b;
        `, [1]);
    });

    it("should use bitwise left", () => {
        execute("[2] << 1", [2, 1]);
    });
});
