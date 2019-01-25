import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { ArrayNode } from "../../src/nodes/arrayNode";
import { ConstantNode } from "../../src/nodes/constant";
import { IfNode } from "../../src/nodes/ifNode";

describe("Array", () => {
    it("should return an array node which has 0 elements", () => {
        const a = new Analyser("[]").analyse();
        assert(a instanceof ArrayNode && a.elements.length === 0);
    });

    it("should return an array node with 3 constant nodes in its elements", () => {
        const a = new Analyser("[0, 1, 2]").analyse() as ArrayNode;
        assert(a instanceof ArrayNode && a.elements.length === 3);
        a.elements.forEach((e, index) => assert(e instanceof ConstantNode && e.value === index));
    });
    it("should return an array node with 3 constant nodes in its elements even parethetized", () => {
        const a = new Analyser("([0, 1, 2])").analyse() as ArrayNode;
        assert(a instanceof ArrayNode && a.elements.length === 3);
        a.elements.forEach((e, index) => assert(e instanceof ConstantNode && e.value === index));
    });

    it("should return an array node with ternary nodes in its elements", () => {
        const a = new Analyser("[(1 ? 2 : 3), 2 ? 3 : 4]").analyse() as ArrayNode;
        assert(a instanceof ArrayNode && a.elements.length === 2);
        a.elements.forEach(e => assert(e instanceof IfNode));
    });
});
