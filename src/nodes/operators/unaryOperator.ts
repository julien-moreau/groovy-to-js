import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";

export class UnaryOperatorNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public operator: ETokenType, public right: Node) {
        super(ENodeType.UnaryOperator);
    }

    /**
     * Returns the operator string
     */
    public get operatorString(): string {
        switch (this.operator) {
            case ETokenType.Minus: return "-";
            case ETokenType.Plus: return "+";
            case ETokenType.Not: return "!";
            default: throw new Error("Invalid Operator.");
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.operatorString}(${this.right.toString()})`;
    }
}