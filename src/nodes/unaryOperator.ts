import { Node, ENodeType } from "./node";
import { ETokenType } from "../tokenizer/tokenizer";

export class UnaryOperatorNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public operator: ETokenType, public right: Node) {
        super(ENodeType.UnaryOperator);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `-${this.right.toString()}`;
    }
}
