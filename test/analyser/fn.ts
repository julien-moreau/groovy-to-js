import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { FunctionDeclarationNode } from "../../src/nodes/types/functionDeclaration";

describe("Function", () => {
    it("should return a function declaration node", () => {
        const a = new Analyser("def fn(arg) { }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 1);
        assert(a.name === "fn");
    });

    it("should return a function declaration node which has no arguments", () => {
        const a = new Analyser("def fn() { }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 0);
        assert(a.name === "fn");
    });

    it("should return a function declaration (closure) which is empty", () => {
        const a = new Analyser("def fn = { }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 0);
        assert(a.name === "fn");
    });

    it("should return a function declaration (closure) which has no arguments and a pointer", () => {
        const a = new Analyser("def fn = { -> }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 0);
        assert(a.name === "fn");
    });

    it("should return a function declaration (closure) node which has a pointer and a block", () => {
        const a = new Analyser("def fn = { -> return 0; }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 0);
        assert(a.name === "fn");
    });
});
