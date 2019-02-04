import { Node, ENodeType } from "./node";
import { ETokenType } from "../tokenizer/tokenizer";

export class CommentNode extends Node {
    /**
     * Constructor
     */
    constructor(public type: ETokenType, public comment: string) {
        super(ENodeType.Comment);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return this.comment;
    }
}
