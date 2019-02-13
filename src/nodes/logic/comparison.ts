import { Node, ENodeType } from "../node";
import { ETokenType } from "../../tokenizer/tokenizer";

export class ComparisonNode extends Node {
    /**
     * Constructor
     * @param data the binary operator data
     */
    constructor(
        public readonly comparison: ETokenType,
        public readonly left: Node,
        public readonly right: Node,
        public readonly comments: Node[] = []
    ) {
        super(ENodeType.Comparison);
    }

    /**
     * Returns the operator string
     */
    public get comparisonString(): string {
        switch (this.comparison) {
            case ETokenType.Inferior: return "<";
            case ETokenType.InferiorOrEqual: return "<=";
            case ETokenType.Superior: return ">";
            case ETokenType.SuperiorOrEqual: return ">=";
            case ETokenType.Equality: return "===";
            default: throw new Error("Invalid comparison.");
        }
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}${this.left.toString()} ${this.comparisonString} ${this.right.toString()}`;
    }
}
