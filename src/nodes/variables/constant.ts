import { Node, ENodeType } from "../node";

export type PrimitiveType = number | string | boolean;

export class ConstantNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public readonly value: PrimitiveType, public comments: Node[]) {
        super(ENodeType.Constant);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.commentsToString()}${this.value.toString()}`;
    }
}
