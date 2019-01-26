import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { MapNode } from "../../src/nodes/types/map";
import { ConstantNode } from "../../src/nodes/variables/constant";
import { VariableNode } from "../../src/nodes/variables/variable";
import { TernaryNode } from "../../src/nodes/logic/ternary";

describe("Map", () => {
    it("should return a map node which has 0 elements", () => {
        const a = new Analyser("[:]").analyse();
        assert(a instanceof MapNode && a.elements.length === 0);
    });

    it("should return a map node which as 1 element", () => {
        const a = new Analyser("[a:0]").analyse() as MapNode;
        assert(a instanceof MapNode && a.elements.length === 1);
        assert(a.elements[0].left instanceof VariableNode && (a.elements[0].left as VariableNode).name === "a");
        assert(a.elements[0].right instanceof ConstantNode && (a.elements[0].right as ConstantNode).value === 0);
    });

    it("should return a map node which as more than 1 element", () => {
        const a = new Analyser("[a: 0, b: 1]").analyse() as MapNode;
        assert(a instanceof MapNode && a.elements.length === 2);
        assert(a.elements[0].left instanceof VariableNode && (a.elements[0].left as VariableNode).name === "a");
        assert(a.elements[0].right instanceof ConstantNode && (a.elements[0].right as ConstantNode).value === 0);
        assert(a.elements[1].left instanceof VariableNode && (a.elements[1].left as VariableNode).name === "b");
        assert(a.elements[1].right instanceof ConstantNode && (a.elements[1].right as ConstantNode).value === 1);
    });

    it("should return a map which as ternaries", () => {
        const a = new Analyser("[a: (1 ? 2 : 3), b: (4 ? 5 : 6)]").analyse() as MapNode;
        assert(a instanceof MapNode && a.elements.length === 2);
        assert(a.elements[0].left instanceof VariableNode && (a.elements[0].left as VariableNode).name === "a");
        assert(a.elements[0].right instanceof TernaryNode);
        assert(a.elements[1].left instanceof VariableNode && (a.elements[1].left as VariableNode).name === "b");
        assert(a.elements[1].right instanceof TernaryNode);
    });
});
