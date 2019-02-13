import { Node, ENodeType } from "./node";
import { ETokenType } from "../tokenizer/tokenizer";

export class CommentNode extends Node {
    /**
     * Constructor
     */
    constructor(
        public readonly type: ETokenType,
        public readonly comment: string,
        public readonly left: Node = null,
        public readonly right: Node = null
    ) {
        super(ENodeType.Comment);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.left ? this.left.toString() : ""}${this.comment}${this.right ? this.right.toString() : ""}`;
    }
}
