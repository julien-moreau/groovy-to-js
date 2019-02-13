import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";

export class LogicNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(
        public readonly operator: ETokenType,
        public readonly left: Node,
        public readonly right: Node,
        public readonly comments: Node[] = []
    ) {
        super(ENodeType.LogicOperator);
    }

    /**
     * Returns the operator string
     */
    public get operatorString(): string {
        switch (this.operator) {
            case ETokenType.And: return "&&";
            case ETokenType.Or: return "||";
            default: throw new Error("Invalid Logic Operator.");
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}(${this.left.toString()} ${this.operatorString} ${this.right.toString()})`;
    }
}
