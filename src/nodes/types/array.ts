import { Node, ENodeType } from "../node";

export class ArrayNode extends Node {
    /**
     * Constructor
     * @param data the unary operator data
     */
    constructor(public readonly elements: Node[]) {
        super(ENodeType.Array);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `[${this.elements.map(e => e.toString()).join(", ")}]`;
    }
}
