import { Node, ENodeType } from "./node";

export class ErrorNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public readonly message: string) {
        super(ENodeType.Error);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return this.message;
    }
}
