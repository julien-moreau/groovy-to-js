import { Node, ENodeType } from "./node";

export class BreakNode extends Node {
    /**
     * Constructor
     */
    constructor() {
        super(ENodeType.Break);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return "break";
    }
}
