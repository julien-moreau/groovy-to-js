import { Node, ENodeType } from "../node";

export class ReturnNode extends Node {
    /**
     * Constructor
     * @param type the node type
     */
    constructor(public readonly right: Node) {
        super(ENodeType.Return);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `return ${this.right.toString()}`;
    }
}
