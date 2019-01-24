import { Node, ENodeType } from "./node";
import { ETokenType } from "../tokenizer/tokenizer";

export class BinaryOperatorNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(public operator: ETokenType, public left: Node, public right: Node) {
        super(ENodeType.BinaryOperator);
    }

    /**
     * Returns the operator string
     */
    public get operatorString(): string {
        switch (this.operator) {
            case ETokenType.Minus: return "-";
            case ETokenType.Plus: return "+";
            case ETokenType.Mult: return "*";
            case ETokenType.Div: return "/";
            default: throw new Error("Invalid Operator.");
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `(${this.left.toString()} ${this.operatorString} ${this.right.toString()})`;
    }
}
