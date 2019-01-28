import * as assert from "assert";

import { Analyser } from "../../src/analyser/analyser";
import { ETokenType } from "../../src/tokenizer/tokenizer";

import { BinaryOperatorNode } from "../../src/nodes/operators/binaryOperator";
import { VariableDeclarationNode } from "../../src/nodes/variables/variableDeclaration";
import { ConstantNode } from "../../src/nodes/variables/constant";
import { TernaryNode } from "../../src/nodes/logic/ternary";
import { VariableNode } from "../../src/nodes/variables/variable";
import { ErrorNode } from "../../src/nodes/error";
import { EndOfInstructionNode } from "../../src/nodes/endOfInstruction";
import { LogicNode } from "../../src/nodes/operators/logicOperator";
import { CastOperatorNode } from "../../src/nodes/operators/castOperator";

describe("Analyser", () => {
    it("should expose current root node", () => {
        const a = new Analyser("2 + 3");
        const n = a.analyse() as BinaryOperatorNode;
        assert(a.rootNode === n);
    });

    it("should return a binary operator node when 2 constants", () => {
        const a = new Analyser("2 + 3").analyse() as BinaryOperatorNode;
        assert(a instanceof BinaryOperatorNode);
        assert(a.operator === ETokenType.Plus);
        assert(a.left instanceof ConstantNode && a.left.value === 2);
        assert(a.right instanceof ConstantNode && a.right.value === 3);
    });

    it("should return a variable node", () => {
        const a = new Analyser("x").analyse() as VariableNode;
        assert(a instanceof VariableNode);
        assert(a.name === "x");
    });

    it("should return a binary operator node with variable nodes", () => {
        const a = new Analyser("x + y").analyse() as BinaryOperatorNode;
        assert(a instanceof BinaryOperatorNode);
        assert(a.left instanceof VariableNode && a.left.name === "x");
        assert(a.right instanceof VariableNode && a.right.name === "y");
    });

    it("should return a binary operator node when 2 constants parenthetized", () => {
        const a = new Analyser("(2 + 3)").analyse() as BinaryOperatorNode;
        assert(a instanceof BinaryOperatorNode);
        assert(a.operator === ETokenType.Plus);
        assert(a.left instanceof ConstantNode && a.left.value === 2);
        assert(a.right instanceof ConstantNode && a.right.value === 3);
    });

    it("should return a binary operator node when 3 constants", () => {
        const a = new Analyser("2 + 3 - 4").analyse() as BinaryOperatorNode;
        const left = a.left as BinaryOperatorNode;

        assert(a instanceof BinaryOperatorNode);
        assert(a.operator === ETokenType.Minus);
        assert(a.right instanceof ConstantNode && a.right.value === 4);

        assert(left instanceof BinaryOperatorNode);
        assert(left.operator === ETokenType.Plus);
        assert(left.left instanceof ConstantNode && left.left.value === 2);
        assert(left.right instanceof ConstantNode && left.right.value === 3);
    });

    it("should return a binary operator node for multiplication", () => {
        const a = new Analyser("2 * 4").analyse() as BinaryOperatorNode;
        assert(a instanceof BinaryOperatorNode);
        assert(a.operator === ETokenType.Mult);
        assert(a.left instanceof ConstantNode && a.left.value === 2);
        assert(a.right instanceof ConstantNode && a.right.value === 4);
    });

    it("should return a binary operator node when has parenthesis", () => {
        const a = new Analyser("2 * (4 + 3)").analyse() as BinaryOperatorNode;
        const right = a.right as BinaryOperatorNode;

        assert(a instanceof BinaryOperatorNode);
        assert(a.operator === ETokenType.Mult);
        assert(a.left instanceof ConstantNode && a.left.value === 2);

        assert(right instanceof BinaryOperatorNode);
        assert(right.operator === ETokenType.Plus);
        assert(right.left instanceof ConstantNode && right.left.value === 4);
        assert(right.right instanceof ConstantNode && right.right.value === 3);
    });
    
    it("should return a variable declaration", () => {
        const a = new Analyser("String a").analyse() as VariableDeclarationNode;
        assert(a instanceof VariableDeclarationNode);
        assert(a.name === "a");
        assert(a.type === "String");
        assert(a.value === null);
    });

    it("should return a variable declaration with has a value whith the associated type", () => {
        const a = new Analyser(`def a = "helloworld"`).analyse() as VariableDeclarationNode;
        assert(a instanceof VariableDeclarationNode);
        assert(a.name === "a");
        assert(a.type === "string");
        assert(a.value instanceof ConstantNode && a.value.value === `"helloworld"`);
    });

    it("should parse ternary", () => {
        const a = new Analyser("1 ? 2 : 3").analyse() as TernaryNode;
        assert(a instanceof TernaryNode);
        assert(a.condition instanceof ConstantNode && a.condition.value === 1);
        assert(a.ifTrue instanceof ConstantNode && a.ifTrue.value === 2);
        assert(a.ifFalse instanceof ConstantNode && a.ifFalse.value === 3);
    });

    it("should parse ternary with semicolon", () => {
        const a = new Analyser("1 ? 2 : 3;").analyse() as EndOfInstructionNode;
        assert(a instanceof EndOfInstructionNode);

        const e = a.left as TernaryNode;
        assert(e instanceof TernaryNode);
        assert(e.condition instanceof ConstantNode && e.condition.value === 1);
        assert(e.ifTrue instanceof ConstantNode && e.ifTrue.value === 2);
        assert(e.ifFalse instanceof ConstantNode && e.ifFalse.value === 3);
    });

    it("should parse ternary even parenthetized", () => {
        const a = new Analyser("(1 ? 2 : 3)").analyse() as TernaryNode;
        assert(a instanceof TernaryNode);
        assert(a.condition instanceof ConstantNode && a.condition.value === 1);
        assert(a.ifTrue instanceof ConstantNode && a.ifTrue.value === 2);
        assert(a.ifFalse instanceof ConstantNode && a.ifFalse.value === 3);
    });

    it("should parse ternary even double parenthetized", () => {
        const a = new Analyser("((1 ? 2 : 3))").analyse() as TernaryNode;
        assert(a instanceof TernaryNode);
        assert(a.condition instanceof ConstantNode && a.condition.value === 1);
        assert(a.ifTrue instanceof ConstantNode && a.ifTrue.value === 2);
        assert(a.ifFalse instanceof ConstantNode && a.ifFalse.value === 3);
    });

    it("should parse a post self minus operation", () => {
        const a = new Analyser("a--").analyse() as VariableNode;
        assert(a instanceof VariableNode && a.postOperator === ETokenType.SelfMinus);
    });

    it("should parse a post self plus operation", () => {
        const a = new Analyser("a++").analyse() as VariableNode;
        assert(a instanceof VariableNode && a.postOperator === ETokenType.SelfPlus);
    });

    it("should parse a pre self minus operation", () => {
        const a = new Analyser("--a").analyse() as VariableNode;
        assert(a instanceof VariableNode && a.preOperator === ETokenType.SelfMinus);
    });

    it("should parse a pre self plus operation", () => {
        const a = new Analyser("++a").analyse() as VariableNode;
        assert(a instanceof VariableNode && a.preOperator === ETokenType.SelfPlus);
    });

    it("should parse a += asignment", () => {
        const a = new Analyser("a += a").analyse() as BinaryOperatorNode;
        assert(a instanceof BinaryOperatorNode);
        assert(a.operatorMethodString === "add");
    });

    it("should return error node for broken ternary", () => {
        const a = new Analyser("1 ? 3").analyse() as ErrorNode;
        assert(a instanceof ErrorNode);
    });

    it("should parse logic operator and", () => {
        const a = new Analyser("a && (b || c)").analyse() as LogicNode;
        assert(a instanceof LogicNode);
        assert(a.left instanceof VariableNode && a.left.name === "a");
        
        const b = a.right as LogicNode;
        assert(b instanceof LogicNode);
        assert(b.left instanceof VariableNode && b.left.name === "b");
        assert(b.right instanceof VariableNode && b.right.name === "c");
    });

    it("should return a variable name which comes from an object", () => {
        const a = new Analyser("a.b").analyse() as VariableNode;
        assert(a instanceof VariableNode && a.name === "a.b");
    });

    it("should return cast operator node", () => {
        const a = new Analyser("(int)a").analyse() as CastOperatorNode;
        assert(a instanceof CastOperatorNode && a.type === "int");
    });
});
