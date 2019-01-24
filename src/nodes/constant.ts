import { Node, ENodeType } from "./node";

export class ConstantNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public readonly value: number | string | boolean) {
        super(ENodeType.Constant);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return this.value.toString();
    }
}
