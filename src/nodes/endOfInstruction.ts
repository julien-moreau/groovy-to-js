import { Node, ENodeType } from "./node";

export class EndOfInstructionNode extends Node {
    /**
     * Constructor
     * @param type the node type
     */
    constructor(public left: Node) {
        super(ENodeType.EndOfInstruction);
    }

    /**
     * Returns the node's string
     */
    public toString(): string {
        return `${this.left.toString()};`;
    }
}
