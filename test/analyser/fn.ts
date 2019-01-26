import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { FunctionDeclarationNode } from "../../src/nodes/types/functionDeclaration";

describe("Function", () => {
    it("should return a function node", () => {
        const a = new Analyser("def fn(arg) { }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 1);
        assert(a.name === "fn");
    });
});
