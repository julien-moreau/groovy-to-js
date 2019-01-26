import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { FunctionDeclarationNode } from "../../src/nodes/function/functionDeclaration";
import { FunctionCallNode } from "../../src/nodes/function/functionCall";

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

    it("should return a function declaration (closure) which has arguments and a pointer", () => {
        const a = new Analyser("def fn = { a -> return a; }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 1);
        assert(a.name === "fn");
    });

    it("should return a function declaration (closure) node which has a pointer and a block", () => {
        const a = new Analyser("def fn = { -> return 0; }").analyse() as FunctionDeclarationNode;
        assert(a instanceof FunctionDeclarationNode);
        assert(a.args.length === 0);
        assert(a.name === "fn");
    });

    it("should return a function call node which has 0 arguments", () => {
        const a = new Analyser("fn()").analyse() as FunctionCallNode;
        assert(a instanceof FunctionCallNode && a.name === "fn" && a.args.length === 0);
    });

    it("should return a function call node which has elements arguments", () => {
        const a = new Analyser("fn(a, 1)").analyse() as FunctionCallNode;
        assert(a instanceof FunctionCallNode && a.name === "fn" && a.args.length === 2);
    });

    it("should return a function call node which has a function call as argument", () => {
        const a = new Analyser("fn1(fn2())").analyse() as FunctionCallNode;
        assert(a instanceof FunctionCallNode && a.name === "fn1" && a.args.length === 1);

        const arg1 = a.args[0] as FunctionCallNode;
        assert(arg1 instanceof FunctionCallNode && arg1.name === "fn2");
    });
});
