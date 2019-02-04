import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { ETokenType } from "../../src/tokenizer/tokenizer";

import { BinaryOperatorNode } from "../../src/nodes/operators/binaryOperator";
import { ConstantNode } from "../../src/nodes/variables/constant";

describe("Analyser", () => {
    it("should ignore comments", () => {
        const a = new Analyser("2 /* Comment 1*/ + /* Comment 2 */ 3");
        const n = a.analyse() as BinaryOperatorNode;
        assert(n instanceof BinaryOperatorNode);
    });

    it("should keep comments in an unary expression", () => {
        const a = new Analyser("/* Comment 0 */ 2 /* Comment 1*/ + /* Comment 2 */ 3 /* Comment 3 */", { keepComments: true });
        const n = a.analyse() as BinaryOperatorNode;
        assert(n instanceof BinaryOperatorNode);
        assert(n.operator === ETokenType.Plus);
        assert(n.left instanceof ConstantNode && n.right instanceof ConstantNode);
    });
});
